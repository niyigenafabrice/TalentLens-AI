import Activity from "../models/activity.model";

export const logActivity = async (
  action: string,
  entity: string,
  details?: string,
  icon?: string,
  color?: string,
  entityId?: string,
  userName?: string
) => {
  try {
    await Activity.create({
      action,
      entity,
      details: details || "",
      icon: icon || "info",
      color: color || "#1d4ed8",
      entityId: entityId || undefined,
      userName: userName || "System",
    });
  } catch (e) {
    console.error("Failed to log activity:", e);
  }
};
