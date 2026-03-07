import mongoose from "mongoose";
import { env } from "@/lib/env";

declare global {
  // eslint-disable-next-line no-var
  var mongooseConn: Promise<typeof mongoose> | undefined;
}

export const connectToDatabase = async (): Promise<typeof mongoose> => {
  if (global.mongooseConn) {
    return global.mongooseConn;
  }

  global.mongooseConn = mongoose.connect(env.MONGODB_URI, {
    dbName: "bucketlist_mvp"
  });

  return global.mongooseConn;
};
