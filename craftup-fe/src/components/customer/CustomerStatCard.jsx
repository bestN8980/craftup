
const CustomerStatCard = ({
  icon: Icon,
  color,
  title,
  value,
  description,
}) => {
  return (
    <div className="customer-stat-card">
      <div className={`customer-stat-icon ${color}`}>
        <Icon size={21} />
      </div>

      <div>
        <p>{title}</p>
        <h3>{value}</h3>
        <span>{description}</span>
      </div>
    </div>
  );
};

export default CustomerStatCard;
