import { Application, ApplicationResponse } from "../types";

export async function getApplications(): Promise<Application[]> {
  return fetch(`${process.env.API_URL}/applications`)
    .then((response) => response.json())
    .then((applications) =>
      applications.map((application: ApplicationResponse) => ({
        id: application.id,
        userId: application.user_id,
        runescapeName: application.runescape_name,
        referral: application.referral,
        reason: application.reason,
        goals: application.goals,
        status: application.status,
        verdictReason: application.verdict_reason,
        verdictDate: new Date(application.verdict_timestamp),
        date: new Date(application.timestamp),
      }))
    );
}
