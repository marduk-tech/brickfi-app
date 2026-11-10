import { Modal } from "antd";
import { useEffect, useState } from "react";
import { useUser } from "../hooks/use-user";
import { safeStorage } from "../libs/browser-utils";
import { LocalStorageKeys } from "../libs/constants";
import { UserDetailsForm } from "./user-details-form";

// autoPrompt: a signed-in user missing profile.name or profile.email is asked
// for them. Cancelling snoozes it: 1 hour after the first cancel, 4 hours
// after the second, then 12 hours after each one after that. Kept per browser
// in localStorage.
const FIRST_SNOOZE_MS = 1 * 60 * 60 * 1000;
const SECOND_SNOOZE_MS = 4 * 60 * 60 * 1000;
const REPEAT_SNOOZE_MS = 12 * 60 * 60 * 1000;

interface ProfilePromptEntry {
  userId: string;
  dismissCount: number;
  nextAt: number;
}

// the stored entry for this user, or null if none (or it's another user's)
const readProfilePrompt = (userId: string): ProfilePromptEntry | null => {
  try {
    const raw = safeStorage.getItem(LocalStorageKeys.profilePrompt);
    const entry: ProfilePromptEntry | null = raw ? JSON.parse(raw) : null;
    return entry?.userId === userId ? entry : null;
  } catch {
    return null;
  }
};

const isProfilePromptDue = (userId: string) => {
  const entry = readProfilePrompt(userId);
  return !entry || Date.now() >= entry.nextAt;
};

const snoozeProfilePrompt = (userId: string) => {
  const dismissCount = (readProfilePrompt(userId)?.dismissCount || 0) + 1;
  const snoozeMs =
    dismissCount === 1
      ? FIRST_SNOOZE_MS
      : dismissCount === 2
        ? SECOND_SNOOZE_MS
        : REPEAT_SNOOZE_MS;
  try {
    safeStorage.setItem(
      LocalStorageKeys.profilePrompt,
      JSON.stringify({ userId, dismissCount, nextAt: Date.now() + snoozeMs }),
    );
  } catch {}
};

type ProfileEditModalProps =
  // opened and closed by the parent (e.g. the profile page's edit button)
  | { open: boolean; onCancel: () => void; autoPrompt?: never }
  // opens itself for incomplete profiles, on the snooze schedule above
  | { autoPrompt: true; open?: never; onCancel?: never };

export function ProfileEditModal(props: ProfileEditModalProps) {
  const { user } = useUser();
  const [promptOpen, setPromptOpen] = useState(false);
  const userId = user?._id;
  const profileIncomplete =
    !!userId && (!user?.profile?.name || !user?.profile?.email);

  // ask for missing name/email once the user loads, unless snoozed
  useEffect(() => {
    if (!props.autoPrompt) return;
    if (!userId || !profileIncomplete) {
      setPromptOpen(false);
      return;
    }
    if (isProfilePromptDue(userId)) setPromptOpen(true);
  }, [props.autoPrompt, userId, profileIncomplete]);

  const open = props.autoPrompt ? promptOpen : props.open;
  const onCancel = props.autoPrompt
    ? () => {
        if (userId) snoozeProfilePrompt(userId);
        setPromptOpen(false);
      }
    : props.onCancel;

  // saving reloads the page from inside UserDetailsForm
  return (
    <Modal title="" open={open} onCancel={onCancel} footer={[]}>
      <UserDetailsForm ignoreCity={true} ignoreSource={false} />
    </Modal>
  );
}
