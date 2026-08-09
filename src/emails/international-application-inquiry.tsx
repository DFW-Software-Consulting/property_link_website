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

export type InternationalApplicationInquiryEmailProps = {
  /* applicant */
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  /* immigration */
  countryOfCitizenship: string;
  passportIdNumber: string;
  visaType: string;
  visaExpirationDate: string;
  passportFilename?: string;
  /* current landlord */
  landlordFirstName: string;
  landlordLastName: string;
  landlordPhone: string;
  /* relative reference */
  relativeName: string;
  relativePhone: string;
  relationship: string;
  /* tenancy */
  desiredAddress: string;
  desiredMoveInDate: string;
  hasPets: string;
  /* emergency — united states */
  emergencyUsFirstName: string;
  emergencyUsLastName: string;
  emergencyUsPhone: string;
  emergencyUsEmail: string;
  /* emergency — home country */
  emergencyHomeFirstName: string;
  emergencyHomeLastName: string;
  emergencyHomePhone: string;
  emergencyHomeEmail: string;
  /* payment */
  cardholderName: string;
  creditCardNumber: string;
  cardExpirationDate: string;
  securityCode: string;
};

const rowStyle = { margin: "6px 0", fontSize: "14px", lineHeight: "1.5" };

const sectionStyle = {
  fontWeight: 700,
  margin: "18px 0 6px",
  fontSize: "13px",
  letterSpacing: "0.04em",
  textTransform: "uppercase" as const,
  color: "#6b7280",
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Text style={rowStyle}>
      <strong style={{ color: "#1f2533" }}>{label}: </strong>
      <span style={{ color: "#3b4252" }}>{value}</span>
    </Text>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Hr style={{ borderColor: "#e5e7eb", margin: "16px 0 0" }} />
      <Text style={sectionStyle}>{children}</Text>
    </>
  );
}

export function InternationalApplicationInquiryEmail(
  props: InternationalApplicationInquiryEmailProps,
) {
  const {
    firstName,
    lastName,
    email,
    phone,
    gender,
    dateOfBirth,
    countryOfCitizenship,
    passportIdNumber,
    visaType,
    visaExpirationDate,
    passportFilename,
    landlordFirstName,
    landlordLastName,
    landlordPhone,
    relativeName,
    relativePhone,
    relationship,
    desiredAddress,
    desiredMoveInDate,
    hasPets,
    emergencyUsFirstName,
    emergencyUsLastName,
    emergencyUsPhone,
    emergencyUsEmail,
    emergencyHomeFirstName,
    emergencyHomeLastName,
    emergencyHomePhone,
    emergencyHomeEmail,
    cardholderName,
    creditCardNumber,
    cardExpirationDate,
    securityCode,
  } = props;

  const fullName = `${firstName} ${lastName}`.trim();

  return (
    <Html>
      <Head />
      <Preview>
        International rental application from {fullName} — {desiredAddress}
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
            maxWidth: "640px",
          }}
        >
          <Heading
            style={{ fontSize: "18px", margin: "0 0 2px", color: "#1f2533" }}
          >
            New international rental application
          </Heading>
          <Text
            style={{ color: "#6b7280", margin: "0 0 4px", fontSize: "14px" }}
          >
            International resident
          </Text>

          <SectionTitle>Applicant</SectionTitle>
          <Row label="Name" value={fullName} />
          <Row
            label="Email"
            value={<Link href={`mailto:${email}`}>{email}</Link>}
          />
          <Row label="Phone" value={<Link href={`tel:${phone}`}>{phone}</Link>} />
          <Row label="Gender" value={gender} />
          <Row label="Date of birth" value={dateOfBirth} />

          <SectionTitle>Immigration</SectionTitle>
          <Row label="Country of citizenship" value={countryOfCitizenship} />
          <Row label="Passport / ID number" value={passportIdNumber} />
          <Row label="Visa type" value={visaType} />
          <Row label="Visa expiration" value={visaExpirationDate} />
          <Row
            label="Passport scan"
            value={
              passportFilename
                ? `Attached — ${passportFilename}`
                : "Not attached"
            }
          />

          <SectionTitle>Current landlord</SectionTitle>
          <Row
            label="Name"
            value={`${landlordFirstName} ${landlordLastName}`.trim()}
          />
          <Row
            label="Phone"
            value={<Link href={`tel:${landlordPhone}`}>{landlordPhone}</Link>}
          />

          <SectionTitle>Relative reference</SectionTitle>
          <Row label="Name" value={relativeName} />
          <Row
            label="Phone"
            value={<Link href={`tel:${relativePhone}`}>{relativePhone}</Link>}
          />
          <Row label="Relationship" value={relationship} />

          <SectionTitle>Tenancy</SectionTitle>
          <Row label="Desired address" value={desiredAddress} />
          <Row label="Desired move-in" value={desiredMoveInDate} />
          <Row label="Pets" value={hasPets} />

          <SectionTitle>Emergency contact — United States</SectionTitle>
          <Row
            label="Name"
            value={`${emergencyUsFirstName} ${emergencyUsLastName}`.trim()}
          />
          <Row
            label="Phone"
            value={
              <Link href={`tel:${emergencyUsPhone}`}>{emergencyUsPhone}</Link>
            }
          />
          <Row
            label="Email"
            value={
              <Link href={`mailto:${emergencyUsEmail}`}>{emergencyUsEmail}</Link>
            }
          />

          <SectionTitle>Emergency contact — home country</SectionTitle>
          <Row
            label="Name"
            value={`${emergencyHomeFirstName} ${emergencyHomeLastName}`.trim()}
          />
          <Row
            label="Phone"
            value={
              <Link href={`tel:${emergencyHomePhone}`}>
                {emergencyHomePhone}
              </Link>
            }
          />
          <Row
            label="Email"
            value={
              <Link href={`mailto:${emergencyHomeEmail}`}>
                {emergencyHomeEmail}
              </Link>
            }
          />

          <SectionTitle>Payment</SectionTitle>
          <Row label="Cardholder" value={cardholderName} />
          <Row label="Card number" value={creditCardNumber} />
          <Row label="Expiration" value={cardExpirationDate} />
          <Row label="Security code" value={securityCode} />
          <Text
            style={{
              margin: "10px 0 0",
              fontSize: "12px",
              lineHeight: "1.5",
              color: "#9a3412",
            }}
          >
            Confidential — this message contains identity documents and payment
            card details. Handle it per office policy and delete it once the
            application has been processed.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default InternationalApplicationInquiryEmail;
