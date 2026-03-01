# CHANGELOG - n8n Flows v2 (Security Cleanup)

**Date:** 2026-03-01
**Purpose:** Remove hardcoded secrets, replace hardcoded URLs with environment variables, and document SQL injection risks.

---

## Summary of Changes

### CRITICAL: Hardcoded API Token Removed

The following hardcoded API token was found and replaced with `{{ $env.API_TOKEN }}`:

- **Token value removed:** `SMFGAHDJVqUr2xWifzjpLWC66qdNCPjFGonBROOKs`
- **Affected file:** `AppointmentFlow.json`
  - Node `Professional-Context` (id: `90cc6c5c-78bd-4938-8b69-2e8848f309e9`) - `x-api-token` header
  - Node `CreateAppointment` (id: `8a17b4b0-00ff-49f0-ab81-fbbe8eea0c61`) - `x-api-token` header

### CRITICAL: Hardcoded x-api-key Removed

A long hardcoded `x-api-key` value (starting with `n8n_prod_8K9mP2vL5xQ7wR4nT6yU3oI1aS0dF9gH...`) was found and replaced with `{{ $env.API_TOKEN }}`:

- **Affected file:** `AppointmentFlow.json`
  - Node `Professional-Context` (id: `90cc6c5c-78bd-4938-8b69-2e8848f309e9`) - `x-api-key` header
  - Node `CreateAppointment` (id: `8a17b4b0-00ff-49f0-ab81-fbbe8eea0c61`) - `x-api-key` header

### HIGH: Hardcoded boki-api URLs Replaced

All instances of `https://boki-api.solercia.com.co` replaced with `{{ $env.API_URL }}`:

- **Affected file:** `AppointmentFlow.json` (2 occurrences)
  - Node `Professional-Context`: `{{ $env.API_URL }}/api/v1/professional/company/{{...}}/agent`
  - Node `CreateAppointment`: `{{ $env.API_URL }}/api/v1/appointments`

### MEDIUM: Hardcoded flows URLs Replaced

All instances of `https://flows.solercia.com.co` replaced with `{{ $env.WEBHOOK_URL }}`:

- **Affected file:** `MainFlow.json` (3 occurrences)
  - Node `RegisterFlow`: webhook call to RegisterClient flow
  - Node `FaqsFlow`: webhook call to FlowFaqs flow
  - Node `AppointmentFlow`: webhook call to AppointmentFlow flow
- **Affected file:** `FlowFaqs.json` (1 occurrence)
  - Node `ControlTokens`: webhook call to Control-Tokens flow

---

## Required n8n Environment Variables

After importing the v2 flows, the following environment variables **must** be configured in n8n (Settings > Environment Variables):

| Variable | Description | Example Value |
|---|---|---|
| `API_TOKEN` | API authentication token for boki-api (used in `x-api-token` and `x-api-key` headers) | `your-secure-api-token-here` |
| `API_URL` | Base URL for the boki-api service (no trailing slash) | `https://boki-api.solercia.com.co` |
| `WEBHOOK_URL` | Base URL for the n8n flows/webhooks (no trailing slash) | `https://flows.solercia.com.co` |

---

## Files With No Secret/URL Changes

- **RegisterClient.json** - No hardcoded secrets or external URLs found. Contains only internal PostgreSQL queries and webhook logic.
- **Control-Tokens.json** - No hardcoded secrets or external URLs found. Contains only internal PostgreSQL queries and n8n API calls.

---

## SQL Injection Risk Analysis

All SQL queries in these flows use string interpolation (`'{{...}}'`) to inject values directly into SQL strings. This is a known limitation of n8n's PostgreSQL node when using raw queries. While n8n controls the execution context, user-supplied data (especially WhatsApp message text) can potentially break or exploit these queries.

### HIGH RISK - Direct User Input in SQL

These queries interpolate raw user input (WhatsApp message text) directly into SQL statements:

#### MainFlow.json

| Node | Risk | Interpolated User Input |
|---|---|---|
| `Insert-User-Message` | **HIGH** - WhatsApp message body inserted directly into INSERT | `{{$node["InboundMessaage"].json.messages[0].text.body}}` |

A message containing a single quote (`'`) will break the query. A crafted message like `'; DROP TABLE "Session"; --` could be destructive.

#### RegisterClient.json

| Node | Risk | Interpolated User Input |
|---|---|---|
| `Update Cedula` | **HIGH** - User message used as identification number in UPDATE | `{{$node["DataClient"].json.user_message}}` |
| `Update Name` | **HIGH** - User message used as first name in UPDATE | `{{$node["DataClient"].json.user_message}}` |
| `InsertHistory` | **HIGH** - System-generated text body in INSERT | `{{ $json.text.body }}` |
| `Insert New Client` | **MEDIUM** - WhatsApp nickname (user-controlled) in INSERT | `{{$node["DataClient"].json.vc_nick}}` |

Note: `Update Cedula` has a regex guard (`^[0-9]+$`) via the `Validate Cedula Input` node that filters to numeric-only input, which mitigates the risk. `Update Name` has a regex guard (`^[a-zA-Z...]+$`) via `Validate Cedula Input1` that filters to letters-only, which also mitigates the risk. However, the `Insert New Client` and `InsertHistory` nodes have no such guards.

#### FlowFaqs.json

| Node | Risk | Interpolated User Input |
|---|---|---|
| `Execute a SQL query4` | **HIGH** - User message AND username inserted into INSERT | `{{$node["Webhook"].json.body.user_message}}`, `{{$node["Webhook"].json.body.vc_user_name}}` |
| `Execute a SQL query5` | **HIGH** - LLM output (intencion) used in UPDATE | `{{ $json.output.intencion }}` |
| `MessageSystem` | **MEDIUM** - LLM-generated message in INSERT | `{{ $node["GenradorMessage"].json.output.message }}` |

The `Execute a SQL query4` node is particularly dangerous because `user_message` comes directly from WhatsApp input with no sanitization.

### MEDIUM RISK - Indirectly User-Controlled Values

These queries interpolate values that originate from WhatsApp metadata (phone numbers, IDs) which are controlled by Meta's API but should still be treated with caution:

#### MainFlow.json

| Node | Interpolated Value |
|---|---|
| `UltimaSession` | `contacts[0].wa_id` (phone number from WhatsApp) |
| `Client` | `metadata.phone_number_id`, `contacts[0].wa_id` |
| `CompanyId` | `metadata.phone_number_id` |
| `DataClient` | `contacts[0].wa_id` |
| `NewSession` | `session_id` (generated UUID), `user_phone`, `workflow.id` |

#### AppointmentFlow.json

| Node | Interpolated Value |
|---|---|
| `Update_step` | `Parcer-Appointment` output (LLM-parsed step name), `DataSession` sessionId |
| `Update_step1` | `DataSession` sessionId |

#### RegisterClient.json

| Node | Interpolated Value |
|---|---|
| `CheckClient` | `DataClient` phone |
| `Session` | `DataClient` sessionId |
| `UpdateSession` | `DataClient` sessionId |
| `Insert New Client` | `DataClient` phone, company_id |

#### FlowFaqs.json

| Node | Interpolated Value |
|---|---|
| `CompanyServices` | `Webhook` body company_id |
| `Execute a SQL query1` | `ContextAgent` output idIntencion (LLM-classified) |
| `Execute a SQL query` | `Webhook` body sessionId |

#### Control-Tokens.json

| Node | Interpolated Value |
|---|---|
| `Execute a SQL query` | `Webhook` body sessionId, executionId; `Tokens` computed values |

### Recommendations

1. **Immediate mitigation**: Move SQL queries to the boki-api NestJS backend where TypeORM parameterized queries provide proper SQL injection protection. Call the API endpoints from n8n instead of direct database queries.

2. **Short-term mitigation**: For queries that must remain in n8n, use the n8n Function node to sanitize inputs before passing them to PostgreSQL nodes:
   ```javascript
   // Example sanitization in a Code node before SQL
   const sanitized = input.replace(/'/g, "''");
   ```

3. **Architecture recommendation**: The ideal pattern is:
   - n8n handles orchestration and webhook reception
   - All database operations go through boki-api REST endpoints
   - boki-api uses TypeORM parameterized queries for all database access
   - This eliminates SQL injection risk entirely from the n8n layer

---

## Per-File Change Summary

### MainFlow.json
- **URLs replaced:** 3 (all `https://flows.solercia.com.co` to `{{ $env.WEBHOOK_URL }}`)
- **Secrets removed:** 0
- **SQL injection risks:** 6 nodes with string-interpolated queries (1 HIGH risk)

### AppointmentFlow.json
- **Secrets removed:** 4 (2x `x-api-token`, 2x `x-api-key` replaced with `{{ $env.API_TOKEN }}`)
- **URLs replaced:** 2 (`https://boki-api.solercia.com.co` to `{{ $env.API_URL }}`)
- **SQL injection risks:** 2 nodes with string-interpolated queries (MEDIUM risk - LLM output and sessionId)

### RegisterClient.json
- **Secrets removed:** 0
- **URLs replaced:** 0
- **SQL injection risks:** 7 nodes with string-interpolated queries (2 HIGH risk from direct user input, mitigated by regex validation)

### FlowFaqs.json
- **URLs replaced:** 1 (`https://flows.solercia.com.co` to `{{ $env.WEBHOOK_URL }}`)
- **Secrets removed:** 0
- **SQL injection risks:** 6 nodes with string-interpolated queries (2 HIGH risk from direct user input)

### Control-Tokens.json
- **Secrets removed:** 0
- **URLs replaced:** 0
- **SQL injection risks:** 1 node with string-interpolated query (LOW risk - values from internal n8n computation)
