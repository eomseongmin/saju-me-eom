export function birthTimeLabelFrom(birthTime, timeUnknown) {
  return timeUnknown ? '모름' : birthTime
}

export function isProfileFormComplete({ name, birthDate, birthTime, timeUnknown, gender, calendar }) {
  return Boolean(name.trim() && birthDate && (birthTime || timeUnknown) && gender && calendar)
}

export function formFromProfile(row) {
  const timeUnknown = !row?.birth_time || row.birth_time === '모름'
  return {
    name: row?.name || '',
    birthDate: row?.birth || '',
    birthTime: timeUnknown ? '' : row.birth_time,
    timeUnknown,
    gender: row?.gender || '',
    calendar: row?.calendar || 'solar',
  }
}

export function profilePayloadFromForm(userId, form) {
  return {
    id: userId,
    name: form.name.trim(),
    birth: form.birthDate,
    birth_time: birthTimeLabelFrom(form.birthTime, form.timeUnknown),
    gender: form.gender,
    calendar: form.calendar,
    updated_at: new Date().toISOString(),
  }
}
