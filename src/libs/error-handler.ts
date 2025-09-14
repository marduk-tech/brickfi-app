// basic version
// export class CustomError extends Error {
//   constructor(status: number, message = "Failed to fetch") {
//     super(`${message}`);
//     this.name = status + "_ERROR";
//   }
// }
// export function getErrorCode(errorName: string) {
//   const match = errorName.match(/^(\d+)_/);
//   return match ? parseInt(match[1], 10) : null;
// }

export class CustomError extends Error {
  constructor(payload: { status: number; title: string; description: string }) {
    super(JSON.stringify(payload));
    this.name = `${payload.status}_ERROR`;
  }

  static safeParse(message: string) {
    try {
      return JSON.parse(message) as {
        status: number;
        title: string;
        description: string;
      };
    } catch {
      return {
        status: 500,
        title: "Unexpected Error",
        description: "Unexpected Error",
      };
    }
  }

  static parse(error: Error) {
    return CustomError.safeParse(error.message);
  }
}
