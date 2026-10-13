import * as Sentry from "@sentry/nextjs";
import type { NextPageContext } from "next";
import NextError, { type ErrorProps } from "next/error";

export default function ErrorPage({ statusCode }: ErrorProps) {
  return <NextError statusCode={statusCode} />;
}

ErrorPage.getInitialProps = async (context: NextPageContext) => {
  await Sentry.captureUnderscoreErrorException(context);
  return NextError.getInitialProps(context);
};
