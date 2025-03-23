import type { AttendanceRetType } from '../../api/attendance/+server.js';
import type { CamAttendanceType } from '../types.js';

export const load = async ({ fetch }) => {
  const att = await fetch('/api/attendance');
  const attData = (await att.json() as AttendanceRetType);
  const activeCam = await fetch('/api/active-cams');
  const activeCamData = await activeCam.json() as {
    activeCamCount: number
  };
  const camAttendance = await fetch('/api/cam-attendance');
  const camAttendanceData = (await camAttendance.json()) as CamAttendanceType;

  const alertNotifsCount = await fetch('/api/all-alerts-count');
  const alertNotifsCountData = await alertNotifsCount.json() as {
    alertNotifsCount: number
  };
  return { attData, activeCamCount: activeCamData.activeCamCount, alertNotifsCount: alertNotifsCountData.alertNotifsCount, camAttendance: camAttendanceData };
};