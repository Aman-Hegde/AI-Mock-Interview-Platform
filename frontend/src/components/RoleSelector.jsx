const ROLE_OPTIONS = [
  "Python Developer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "AI Engineer",
  "Data Analyst",
];


function RoleSelector({ selectedRole, onRoleChange }) {
  return (
    <label className="role-selector">
      <span>Select interview role</span>
      <select
        value={selectedRole}
        onChange={(event) => onRoleChange(event.target.value)}
      >
        <option value="">Choose a role</option>
        {ROLE_OPTIONS.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>
    </label>
  );
}


export default RoleSelector;
