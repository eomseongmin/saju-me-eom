import ProfileFields from './ProfileFields'

function ProfileModal({
  form,
  onFormChange,
  onSave,
  saving,
  error,
}) {
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="onboard-title">
      <div className="modal-card">
        <h2 id="onboard-title">내 사주 정보 입력</h2>
        <p className="modal-lead">처음이시네요. 사주에 필요한 정보를 한 번만 입력해 주세요.</p>

        <ProfileFields
          idPrefix="onboard"
          name={form.name}
          onNameChange={(name) => onFormChange({ name })}
          birthDate={form.birthDate}
          onBirthDateChange={(birthDate) => onFormChange({ birthDate })}
          birthTime={form.birthTime}
          timeUnknown={form.timeUnknown}
          onBirthTimeChange={(birthTime) =>
            onFormChange({ birthTime, timeUnknown: false })
          }
          onTimeUnknownChange={(timeUnknown) =>
            onFormChange({ timeUnknown, birthTime: timeUnknown ? '' : form.birthTime })
          }
          gender={form.gender}
          onGenderChange={(gender) => onFormChange({ gender })}
          calendar={form.calendar}
          onCalendarChange={(calendar) => onFormChange({ calendar })}
        />

        {error && <p className="error">{error}</p>}

        <button type="button" className="submit-btn" onClick={onSave} disabled={saving}>
          {saving ? '저장 중…' : '저장하고 시작하기'}
        </button>
      </div>
    </div>
  )
}

export default ProfileModal
