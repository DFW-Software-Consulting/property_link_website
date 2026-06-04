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
import { PERMISSION_OPTIONS } from "@/lib/schemas/maintenance";
import type { PermissionToEnter } from "@/lib/maintenance/payload";

/**
 * Human-readable companion to submission.json. The property-management app
 * reads the JSON attachment; this body is for staff who open the email.
 */

export type MaintenanceRequestEmailProps = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  building: string;
  apartment: string;
  message: string;
  permissionToEnter: PermissionToEnter;
  petInResidence: boolean;
  photoFilenames: string[];
  submittedAt: string;
};

const permissionLabel: Record<PermissionToEnter, string> = {
  yes: PERMISSION_OPTIONS[0].label,
  no: PERMISSION_OPTIONS[1].label,
  coordinate: PERMISSION_OPTIONS[2].label,
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

export function MaintenanceRequestEmail({
  firstName,
  lastName,
  email,
  phone,
  building,
  apartment,
  message,
  permissionToEnter,
  petInResidence,
  photoFilenames,
  submittedAt,
}: MaintenanceRequestEmailProps) {
  const name = `${firstName} ${lastName}`.trim();
  return (
    <Html>
      <Head />
      <Preview>
        Maintenance request from {name} — {building} {apartment}
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
            maxWidth: "600px",
          }}
        >
          <Heading
            style={{ fontSize: "18px", margin: "0 0 2px", color: "#1f2533" }}
          >
            New maintenance request
          </Heading>
          <Text
            style={{ color: "#6b7280", margin: "0 0 16px", fontSize: "14px" }}
          >
            {building} — Apt {apartment}
          </Text>
          <Hr style={{ borderColor: "#e5e7eb" }} />
          <Row label="Resident" value={name} />
          <Row
            label="Email"
            value={<Link href={`mailto:${email}`}>{email}</Link>}
          />
          <Row label="Phone" value={<Link href={`tel:${phone}`}>{phone}</Link>} />
          <Row label="Building" value={building} />
          <Row label="Apartment" value={apartment} />
          <Row label="Permission to enter" value={permissionLabel[permissionToEnter]} />
          <Row label="Pet in residence" value={petInResidence ? "Yes" : "No"} />
          <Row
            label="Photos"
            value={
              photoFilenames.length
                ? photoFilenames.join(", ")
                : "None attached"
            }
          />
          <Hr style={{ borderColor: "#e5e7eb" }} />
          <Text style={{ fontWeight: 700, margin: "12px 0 4px", color: "#1f2533" }}>
            Description of issue
          </Text>
          <Text style={{ whiteSpace: "pre-wrap", margin: 0, color: "#3b4252" }}>
            {message}
          </Text>
          <Hr style={{ borderColor: "#e5e7eb" }} />
          <Text style={{ color: "#9ca3af", fontSize: "12px", margin: "12px 0 0" }}>
            Submitted {submittedAt}. Structured data is attached as
            submission.json.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default MaintenanceRequestEmail;
