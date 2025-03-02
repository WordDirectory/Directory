import { Header } from "../components/header";
import {
  Body,
  Container,
  Html,
  Section,
  Text,
  Heading,
} from "@react-email/components";
import { AUTH_CONFIG } from "@/config/auth";

export default function EmailVerificationTemplate({
  code = "000000",
  expires_in = `${AUTH_CONFIG.emailVerification.codeExpirationTime} minutes`,
}: {
  code?: string;
  expires_in?: string;
}) {
  return (
    <Html>
      <Body
        style={{
          backgroundColor: "#ffffff",
          fontFamily:
            '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
        }}
      >
        <Container style={{ padding: "40px 20px" }}>
          <Header />

          <Heading
            as="h1"
            style={{
              fontSize: "24px",
              fontWeight: "600",
              color: "#202124",
              textAlign: "left",
              margin: "30px 0 20px",
            }}
          >
            Verification Code
          </Heading>

          <Section style={{ marginBottom: "16px" }}>
            <Text
              style={{
                fontSize: "16px",
                color: "#5f6368",
                margin: "0 0 16px",
              }}
            >
              To complete your verification, please use the code below:
            </Text>
          </Section>

          <Section
            style={{
              backgroundColor: "#ffffff",
              padding: "20px",
              borderRadius: "8px",
              border: "1px solid #e0e0e0",
              textAlign: "left",
            }}
          >
            <Heading
              as="h2"
              style={{
                fontSize: "32px",
                color: "#202124",
                letterSpacing: "4px",
                margin: "0",
                fontFamily: "monospace",
              }}
            >
              {code}
            </Heading>
          </Section>

          <Text
            style={{
              fontSize: "14px",
              color: "#5f6368",
              marginTop: "20px",
              textAlign: "left",
            }}
          >
            This code will expire in {expires_in}. If you did not request this
            code, please ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
