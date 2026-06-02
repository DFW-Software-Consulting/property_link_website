import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Text,
} from "@react-email/components";
import { inquiryTypeLabels, type InquiryType } from "@/lib/schemas/contact";

export type ContactNotificationProps = {
  name: string;
  email: string;
  phone?: string;
  inquiryType: InquiryType;
  company?: string;
  moveInDate?: string;
  message: string;
};

const rowStyle = { margin: "6px 0", fontSize: "14px", lineHeight: "1.5" };

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Text style={rowStyle}>
      <strong style={{ color: "#1f2533" }}>{label}: </strong>
      <span style={{ color: "#3b4252" }}>{value}</span>
    </Text>
  );
}

export function ContactNotificationEmail({
  name,
  email,
  phone,
  inquiryType,
  company,
  moveInDate,
  message,
}: ContactNotificationProps) {
  return (
    <Html>
      <Head />
      <Preview>
        New {inquiryTypeLabels[inquiryType]} inquiry from {name}
      </Preview>
      <Body
        style={{
          backgroundColor: "#f4f3ef",
          fontFamily: "Arial, Helvetica, sans-serif",
          padding: "24px",
        }}
      >
        <Container
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            padding: "28px",
            maxWidth: "560px",
          }}
        >
          <Heading style={{ fontSize: "18px", margin: "0 0 2px", color: "#1f2533" }}>
            New website inquiry
          </Heading>
          <Text style={{ color: "#6b7280", margin: "0 0 16px", fontSize: "14px" }}>
            {inquiryTypeLabels[inquiryType]}
          </Text>
          <Hr style={{ borderColor: "#e5e7eb" }} />
          <Row label="Name" value={name} />
          <Row label="Email" value={<Link href={`mailto:${email}`}>{email}</Link>} />
          {phone ? (
            <Row label="Phone" value={<Link href={`tel:${phone}`}>{phone}</Link>} />
          ) : null}
          {company ? <Row label="Company" value={company} /> : null}
          {moveInDate ? <Row label="Desired move-in" value={moveInDate} /> : null}
          <Hr style={{ borderColor: "#e5e7eb" }} />
          <Text
            style={{ fontWeight: 700, margin: "12px 0 4px", color: "#1f2533" }}
          >
            Message
          </Text>
          <Text style={{ whiteSpace: "pre-wrap", margin: 0, color: "#3b4252" }}>
            {message}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default ContactNotificationEmail;
