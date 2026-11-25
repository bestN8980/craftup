
const categoryItems = [
  {
    name: "Gốm sứ",
    desc: "Nét đẹp từ đất và lửa",
    image: "photo-1578749556568-bc2c40e68b61",
  },
  {
    name: "Dệt may",
    desc: "Sợi tơ, nét văn hóa",
    image: "photo-1601924994987-69e26d50dc26",
  },
  {
    name: "Mây tre đan",
    desc: "Tinh hoa từ thiên nhiên",
    image: "photo-1590736969955-71cc94901144",
  },
  {
    name: "Sơn mài",
    desc: "Vẻ đẹp qua từng lớp sơn",
    image: "photo-1576021182211-9ea8dced3690",
  },
];

function CategorySection() {
  return (
    <section className="section categories-section" id="categories">
      <div className="section-heading">
        <div>
          <span className="eyebrow">KHÁM PHÁ THEO NGHỀ</span>
          <h2>Mỗi chất liệu, một bản sắc</h2>
          <p>
            Khám phá những tinh hoa thủ công từ các làng nghề Việt Nam.
          </p>
        </div>
      </div>

      <div className="category-grid">
        {categoryItems.map((item) => (
          <div className="category-card" key={item.name}>
            <img
              src={`https://images.unsplash.com/${item.image}?w=600`}
              alt={item.name}
            />
            <div className="category-overlay">
              <h3>{item.name}</h3>
              <p>{item.desc}</p>
              <span>{item.name}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default CategorySection;
