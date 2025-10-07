import { json, type RequestEvent } from "@sveltejs/kit";
import { getSubjectsByClassId } from "$lib/server/db";

export const POST = async ({ request, platform }: RequestEvent) => {
  if (!platform?.env?.DB) {
    return json({ error: "Database not available" }, { status: 500 });
  }

  try {
    const body = (await request.json()) as { class_id?: string };
    const { class_id } = body;

    if (!class_id) {
      return json({ subjects: [] });
    }

    const classId = parseInt(class_id, 10);
    if (isNaN(classId)) {
      return json({ subjects: [] });
    }

    const subjects = await getSubjectsByClassId(platform.env.DB, classId);
    return json({ subjects });
  } catch (error) {
    console.error("Get subjects error:", error);
    return json({ error: "Failed to fetch subjects" }, { status: 500 });
  }
};
