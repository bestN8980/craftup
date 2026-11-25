
function StorySection() {
  return (
    <section className="story-section" id="stories">
      <div className="story-image">
        <img
          src="https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=1000"
          alt="Nghệ nhân đang làm việc thủ công"
        />

        <div className="story-image-caption">
          <span>CRAFTUP STORIES</span>
          <strong>
            Đằng sau mỗi sản phẩm là một người giữ nghề.
          </strong>
        </div>
      </div>

      <div className="story-content">
        <span className="eyebrow">CÂU CHUYỆN NGƯỜI GIỮ NGHỀ</span>
        <h2>Không chỉ là sản phẩm, đó còn là di sản.</h2>

        <p>
          Mỗi món đồ thủ công đều chứa đựng sự kiên nhẫn,
          kỹ thuật và tâm huyết của người nghệ nhân. CraftUp
          mong muốn đưa những câu chuyện ấy đến gần hơn với
          cộng đồng.
        </p>

        <ul className="story-list">
          <li>✓ Chân dung những nghệ nhân Việt</li>
          <li>✓ Hành trình gìn giữ nghề truyền thống</li>
          <li>✓ Khám phá kỹ thuật chế tác thủ công</li>
        </ul>

        <a href="#about" className="primary-button">
          Khám phá câu chuyện <span>→</span>
        </a>
      </div>
    </section>
  );
}

export default StorySection;
