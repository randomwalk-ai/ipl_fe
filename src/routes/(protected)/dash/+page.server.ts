import type { AttendanceRetType } from '../../api/attendance/+server.js';

export const load = async ({ fetch }) => {
  const att = await fetch('/api/attendance');
  const attData = (await att.json() as AttendanceRetType);
  return { attData };
};