/**
 * Shared POST-multipart-form-then-parse-error pattern used by every intake
 * form (maintenance, rental application, international application). Each
 * caller supplies its own endpoint and fallback error message.
 */
export async function postFormRequest(
  url: string,
  formData: FormData,
  fallbackErrorMessage: string,
) {
  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as
      | { error?: string }
      | null;
    throw new Error(data?.error ?? fallbackErrorMessage);
  }
  return res.json();
}
