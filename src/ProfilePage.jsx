import ProfileFields from './ProfileFields'

function ProfilePage({
  form,
  onFormChange,
  onSave,
  onBack,
  saving,
  error,
}) {
  return (
    <div className="app-card">
      <h1 className="brand">프로필</h1>
      <p className="lead">저장된 사주 정보를 수정할 수 있어요.</p>

      <ProfileFields
        idPrefix="edit"
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
        {saving ? '저장 중…' : '프로필 저장'}
      </button>
      <button type="button" className="ghost-btn" onClick={onBack}>
        사주로 돌아가기
      </button>
    </div>
  )
}

export default ProfilePage
