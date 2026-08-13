import BirthDatePicker from './BirthDatePicker'

function ProfileFields({
  idPrefix = 'profile',
  name,
  onNameChange,
  birthDate,
  onBirthDateChange,
  birthTime,
  timeUnknown,
  onBirthTimeChange,
  onTimeUnknownChange,
  gender,
  onGenderChange,
  calendar,
  onCalendarChange,
}) {
  return (
    <>
      <div className="field">
        <label htmlFor={`${idPrefix}-name`}>이름</label>
        <input
          id={`${idPrefix}-name`}
          type="text"
          placeholder="이름을 입력하세요"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
        />
      </div>

      <div className="field">
        <span className="field-label">생년월일</span>
        <BirthDatePicker value={birthDate} onChange={onBirthDateChange} />
      </div>

      <div className="field">
        <label htmlFor={`${idPrefix}-birthTime`}>태어난 시간</label>
        <input
          id={`${idPrefix}-birthTime`}
          type="time"
          value={timeUnknown ? '' : birthTime}
          disabled={timeUnknown}
          onChange={(e) => onBirthTimeChange(e.target.value)}
        />
        <label className="option time-unknown">
          <input
            type="checkbox"
            checked={timeUnknown}
            onChange={(e) => onTimeUnknownChange(e.target.checked)}
          />
          모름
        </label>
      </div>

      <fieldset className="field">
        <legend>성별</legend>
        <label className="option">
          <input
            type="radio"
            name={`${idPrefix}-gender`}
            value="male"
            checked={gender === 'male'}
            onChange={(e) => onGenderChange(e.target.value)}
          />
          남성
        </label>
        <label className="option">
          <input
            type="radio"
            name={`${idPrefix}-gender`}
            value="female"
            checked={gender === 'female'}
            onChange={(e) => onGenderChange(e.target.value)}
          />
          여성
        </label>
      </fieldset>

      <fieldset className="field">
        <legend>양력 / 음력</legend>
        <label className="option">
          <input
            type="radio"
            name={`${idPrefix}-calendar`}
            value="solar"
            checked={calendar === 'solar'}
            onChange={(e) => onCalendarChange(e.target.value)}
          />
          양력
        </label>
        <label className="option">
          <input
            type="radio"
            name={`${idPrefix}-calendar`}
            value="lunar"
            checked={calendar === 'lunar'}
            onChange={(e) => onCalendarChange(e.target.value)}
          />
          음력
        </label>
      </fieldset>
    </>
  )
}

export default ProfileFields
