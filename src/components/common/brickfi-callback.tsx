"use client";

import { Button, Flex, Form, Input, Modal, Select, Typography } from "antd";
import { addDays, format, isSaturday, isSunday, isFriday } from "date-fns";

import { useEffect, useState } from "react";
import { useUser } from "../../hooks/use-user";
import {
  useCreateUserMutation,
  useSendUserMailMutation,
  useUpdateUserMutation,
} from "../../hooks/user-hooks";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import LandingHeader from "@/custom-pages/landing/header";
import { useDevice } from "@/hooks/use-device";
import LandingFooter from "@/custom-pages/landing/footer";
import { useParams } from "next/navigation";
import { Loader } from "./loader";

const assistanceOptions = [
  {
    label: (
      <Flex vertical>
        <Typography.Text
          style={{ fontSize: FONT_SIZE.HEADING_3, fontWeight: 500 }}
        >
          Buy With Brickfi
        </Typography.Text>
        <Typography.Text>
          Get end to end Brickfi assistance for your next property purchase.
        </Typography.Text>
      </Flex>
    ),
    value: "Buy With Brickfi",
  },
  {
    label: (
      <Flex vertical>
        <Typography.Text
          style={{ fontSize: FONT_SIZE.HEADING_3, fontWeight: 500 }}
        >
          Property Management
        </Typography.Text>
        <Typography.Text>
          Assistance with resale, selling or other property management services.
        </Typography.Text>
      </Flex>
    ),
    value: "Property Management",
  },
  {
    label: (
      <Flex vertical>
        <Typography.Text
          style={{ fontSize: FONT_SIZE.HEADING_3, fontWeight: 500 }}
        >
          Other General Query
        </Typography.Text>
        <Typography.Text>
          Other specficic queries including project related questions or legal
          help.
        </Typography.Text>
      </Flex>
    ),
    value: "Other General Query",
  },
];

export function BrickfiCallback() {
  const [form] = Form.useForm();

  const { user } = useUser();
  const { isMobile } = useDevice();
  const createUser = useCreateUserMutation({});
  const updateUser = useUpdateUserMutation({ userId: user?._id || "" });
  const sendMail = useSendUserMailMutation();
  const [dayOption, setDayOption] = useState("");
  const [selectedAsstVal, setSelectedAsstVal] = useState("");

  const [formSuccess, setFormSuccess] = useState(false);

  /**
   * Generates AntD Select options based on the current day's logic.
   * Format: "DayName, Date Month" (e.g., "Wed, 18 March")
   */
  const getPickerOptions = () => {
    const today = new Date();
    const options = [];

    // Helper to create the option object
    const createOption = (label: string, date: any) => ({
      label: label, // This is what shows in the dropdown
      value: `${label}, ${format(date, "d MMMM")}`, // e.g., "Wed, 18 March"
    });

    if (isFriday(today)) {
      // Friday: Today, Sat, Sun, Mon
      if (new Date().getHours() < 18) {
        options.push(createOption("Today", today));
      }
      options.push(createOption("Saturday", addDays(today, 1)));
      options.push(createOption("Sunday", addDays(today, 2)));
      options.push(createOption("Monday", addDays(today, 3)));
    } else if (isSaturday(today)) {
      // Saturday: Saturday, Sunday, Monday
      options.push(createOption("Saturday", today));
      options.push(createOption("Sunday", addDays(today, 1)));
      options.push(createOption("Monday", addDays(today, 2)));
    } else if (isSunday(today)) {
      // Sunday: Sunday, Monday, Tuesday
      options.push(createOption("Sunday", today));
      options.push(createOption("Monday", addDays(today, 1)));
      options.push(createOption("Tuesday", addDays(today, 2)));
    } else {
      // Standard Weekday (Mon-Thu): Today, Tomorrow, Saturday, Sunday
      if (new Date().getHours() < 18) {
        options.push(createOption("Today", today));
      }
      options.push(createOption("Tomorrow", addDays(today, 1)));

      // Calculate days until upcoming Saturday/Sunday
      const daysToSat = (6 - today.getDay() + 7) % 7;
      const daysToSun = (0 - today.getDay() + 7) % 7;

      options.push(createOption("Saturday", addDays(today, daysToSat)));
      options.push(createOption("Sunday", addDays(today, daysToSun)));
    }

    return options;
  };

  const getTimeOptions = (dayVal: string) => {
    return [10, 12, 14, 16, 18]
      .filter((t) => {
        if (
          !dayVal ||
          !dayVal.toLowerCase().includes("today") ||
          new Date().getHours() < t
        ) {
          return true;
        }
        return false;
      })
      .map((t) => {
        const val =
          t < 12
            ? `${t}am - ${t + 2}pm`
            : `${t == 12 ? 12 : t - 12}pm - ${t - 10}pm`;
        return {
          label: val,
          value: val,
        };
      });
  };

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.profile.name,
        mobile: user.mobile,
      });
    }
  }, [user, form]);

  const onFinish = async (values: any) => {
    const searchParams = new URLSearchParams(window.location.search);
    const srcIntent = searchParams.get("srcIntent");

    let userId = user?._id;

    if (user) {
      await updateUser.mutateAsync({
        userData: {
          status: "callback-request",
          profile: {
            ...user.profile,
            callbackCategory: values.assistance,
            sourceIntent: srcIntent || "",
            preferredCallbackTime: `${values.day}, ${values.time}`,
          },
        },
      });
    } else {
      const newUser = await createUser.mutateAsync({
        userData: {
          mobile: values.mobile,
          status: "callback-request",
          profile: {
            name: values.name,
            callbackCategory: values.assistance,
            sourceIntent: srcIntent || "",
            preferredCallbackTime: `${values.day}, ${values.time}`,
          },
          countryCode: "91",
        },
      });
      userId = newUser._id;
    }

    setFormSuccess(true);
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Optional: adds a smooth sliding animation
    });
    if (userId) {
      await sendMail.mutateAsync({
        userId,
        emailType: "callback-request",
        params: {
          name: values.name,
          mobile: values.mobile,
          source: srcIntent || "",
          callbackCategory: values.assistance,
          callbackTime: `${values.day}, ${values.time}`,
        },
      });
    }
  };

  const [flickerWait, setFlickerWait] = useState(true);

  useEffect(() => {
    setTimeout(
      () => {
        setFlickerWait(false);
      },
      isMobile ? 1000 : 100,
    );
  });

  if (flickerWait) {
    return (
      <Flex style={{ marginTop: 200 }} align="center" justify="center">
        <Loader></Loader>
      </Flex>
    );
  }

  return (
    <Flex gap={8} vertical style={{ paddingTop: 24, paddingBottom: 16 }}>
      <>
        <LandingHeader></LandingHeader>
        <Flex
          vertical={isMobile}
          style={{
            marginTop: 100,
            width: isMobile ? "90%" : "100%",
            maxWidth: 1200,
            margin: "auto",
            paddingTop: 100,
          }}
          gap={64}
        >
          {!isMobile ? (
            <Flex
              style={{ width: isMobile ? "100%" : "40%", height: 600 }}
              align="center"
              justify="flex-start"
            >
              <img
                src="/images/landing/callback-banner.png"
                style={{ height: isMobile ? 250 : 400, width: "auto" }}
              ></img>
            </Flex>
          ) : null}
          <Flex
            vertical
            style={{ width: isMobile ? "100%" : "60%" }}
            align="center"
            justify="center"
          >
            {formSuccess ? (
              <Flex vertical>
                <Typography.Text
                  style={{
                    fontSize: FONT_SIZE.HEADING_1 * 1.3,
                    marginBottom: 24,
                    lineHeight: "100%",
                  }}
                >
                  Get in Touch with a Brickfi Advisor
                </Typography.Text>
                <Flex
                  vertical
                  style={{
                    backgroundColor: COLORS.bgColorBlue,
                    padding: "16px",
                    borderRadius: 16,
                  }}
                >
                  <Typography.Text
                    style={{
                      fontSize: FONT_SIZE.HEADING_2,
                      fontWeight: 500,
                      lineHeight: "120%",
                    }}
                  >
                    Wohoo! Your request is submitted.
                  </Typography.Text>
                  <Typography.Text
                    style={{
                      fontSize: FONT_SIZE.HEADING_3,
                      lineHeight: "120%",
                    }}
                  >
                    Thank you for your request. A Brickfi Advisor will call you
                    back at your preferred time.
                  </Typography.Text>
                </Flex>
              </Flex>
            ) : (
              <Flex vertical gap={8}>
                <Typography.Text
                  style={{
                    fontSize: isMobile
                      ? FONT_SIZE.HEADING_1 * 1.2
                      : FONT_SIZE.HEADING_1 * 1.5,
                    lineHeight: "100%",
                  }}
                >
                  Get in Touch with a Brickfi Advisor
                </Typography.Text>
                <Typography.Text
                  style={{
                    fontSize: FONT_SIZE.HEADING_3,
                    color: COLORS.textColorMedium,
                    lineHeight: "120%",
                  }}
                >
                  Fill details below and one of our advisors will get in touch
                  with you.
                </Typography.Text>
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={onFinish}
                  style={{
                    marginTop: 16,
                    display: "flex",
                    flexDirection: "column",
                    gap: 0,
                    padding: "8px 16px",
                    backgroundColor: COLORS.bgColorLightBlue,
                  }}
                >
                  <Form.Item
                    label="Your Name"
                    name="name"
                    rules={[{ required: true }]}
                  >
                    <Input disabled={!!user} />
                  </Form.Item>
                  <Form.Item
                    label="Your Mobile Number"
                    name="mobile"
                    rules={[{ required: true }]}
                  >
                    <Input disabled={!!user} />
                  </Form.Item>
                  <Form.Item
                    label="What kind of assistance do you need"
                    name="assistance"
                    rules={[{ required: true }]}
                  >
                    <Select
                      placeholder="Select an option"
                      style={{ width: "100%", fontSize: FONT_SIZE.HEADING_3 }}
                      allowClear
                      optionLabelProp="label"
                      onChange={(value) => {
                        setSelectedAsstVal(value);
                      }}
                    >
                      {assistanceOptions.map((option) => (
                        <Select.Option
                          key={option.value}
                          value={option.value}
                          label={option.value}
                        >
                          {option.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Flex vertical={isMobile} gap={16}>
                    <Form.Item
                      label="What day works for you?"
                      name="day"
                      rules={[{ required: true }]}
                    >
                      <Select
                        placeholder="Select an option"
                        style={{ width: "100%", fontSize: FONT_SIZE.HEADING_3 }}
                        allowClear
                        disabled={!selectedAsstVal}
                        onChange={(value: any) => {
                          setDayOption(value);
                          form.setFieldsValue({
                            time: getTimeOptions(value)[0],
                          });
                        }}
                        optionLabelProp="label"
                      >
                        {getPickerOptions().map((option) => (
                          <Select.Option
                            key={option.value}
                            value={option.value}
                            label={option.value}
                          >
                            {option.label}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      label="What time works for you?"
                      name="time"
                      rules={[{ required: true }]}
                    >
                      <Select
                        placeholder="Select an option"
                        style={{ width: "100%", fontSize: FONT_SIZE.HEADING_3 }}
                        allowClear
                        disabled={!dayOption}
                        optionLabelProp="label"
                      >
                        {getTimeOptions(dayOption).map((option) => (
                          <Select.Option
                            key={option.value}
                            value={option.value}
                            label={option.value}
                          >
                            {option.label}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Flex>
                </Form>
              </Flex>
            )}

            <Flex
              style={{
                marginTop: 24,
                alignSelf: isMobile ? "center" : "flex-end",
                marginLeft: isMobile ? 8 : 32,
                marginBottom: isMobile ? 0 : 24,
              }}
              gap={16}
            >
              {formSuccess ? null : (
                <Button
                  onClick={() => form.submit()}
                  type="primary"
                  disabled={!selectedAsstVal || !dayOption}
                  loading={
                    createUser.isPending ||
                    updateUser.isPending ||
                    sendMail.isPending
                  }
                  style={{ width: 200 }}
                >
                  {"Submit"}
                </Button>
              )}
            </Flex>
          </Flex>
          {isMobile ? (
            <Flex
              style={{
                width: isMobile ? "100" : "40%",
                height: isMobile ? 400 : 600,
              }}
              align={!isMobile ? "center" : "flex-start"}
              justify={isMobile ? "center" : "flex-start"}
            >
              <img
                src="/images/landing/callback-banner.png"
                style={{ height: isMobile ? 320 : 400, width: "auto" }}
              ></img>
            </Flex>
          ) : null}
        </Flex>
        <LandingFooter></LandingFooter>
      </>
    </Flex>
  );
}
