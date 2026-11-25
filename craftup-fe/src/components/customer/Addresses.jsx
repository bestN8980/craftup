
import { useCallback, useEffect, useState } from "react";
import {
  MapPin,
  Plus,
  Home,
  Pencil,
  Trash2,
  Star,
  X,
  Phone,
  UserRound,
} from "lucide-react";

import api from "../../services/api";
import "../../styles/Addresses.css";

const emptyForm = {
  name: "",
  phone: "",
  address: "",
  ward: "",
  district: "",
  city: "",
  isDefault: false,
};

// Chuyển dữ liệu từ Backend sang cấu trúc giao diện
const mapAddress = (item) => ({
  id: item.id,
  name: item.recipientName,
  phone: item.phone,
  address: item.streetAddress,
  ward: item.ward,
  district: item.district,
  city: item.province,
  isDefault: item.isDefault,
});

// Chuyển dữ liệu từ giao diện sang Backend
const mapPayload = (form) => ({
  recipientName: form.name.trim(),
  phone: form.phone.trim(),
  streetAddress: form.address.trim(),
  ward: form.ward.trim(),
  district: form.district.trim(),
  province: form.city.trim(),
  isDefault: form.isDefault,
});

function AddressModal({ address, onClose, onSave }) {
  const [form, setForm] = useState(
    address ? { ...address } : { ...emptyForm }
  );
  const [saving, setSaving] = useState(false);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      await onSave(mapPayload(form));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="address-modal-overlay" onClick={onClose}>
      <div
        className="address-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="address-modal-header">
          <div>
            <span className="address-modal-eyebrow">
              THÔNG TIN GIAO HÀNG
            </span>
            <h2>{address ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}</h2>
          </div>

          <button
            type="button"
            className="address-modal-close"
            onClick={onClose}
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="address-form-grid">
            <div className="address-form-group">
              <label>Họ và tên người nhận *</label>
              <input
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Nhập họ và tên"
                required
              />
            </div>

            <div className="address-form-group">
              <label>Số điện thoại *</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="Nhập số điện thoại"
                pattern="[0-9]{10,11}"
                title="Số điện thoại gồm 10 hoặc 11 chữ số"
                required
              />
            </div>

            <div className="address-form-group address-form-full">
              <label>Địa chỉ cụ thể *</label>
              <input
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                placeholder="Số nhà, tên đường, ngõ..."
                required
              />
            </div>

            <div className="address-form-group">
              <label>Phường / Xã *</label>
              <input
                value={form.ward}
                onChange={(e) => updateField("ward", e.target.value)}
                placeholder="Nhập phường / xã"
                required
              />
            </div>

            <div className="address-form-group">
              <label>Quận / Huyện *</label>
              <input
                value={form.district}
                onChange={(e) => updateField("district", e.target.value)}
                placeholder="Nhập quận / huyện"
                required
              />
            </div>

            <div className="address-form-group address-form-full">
              <label>Tỉnh / Thành phố *</label>
              <input
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
                placeholder="Nhập tỉnh / thành phố"
                required
              />
            </div>
          </div>

          <label className="address-default-checkbox">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) =>
                updateField("isDefault", e.target.checked)
              }
            />
            Đặt làm địa chỉ mặc định
          </label>

          <div className="address-modal-actions">
            <button
              type="button"
              className="address-cancel-btn"
              onClick={onClose}
              disabled={saving}
            >
              Hủy
            </button>

            <button
              type="submit"
              className="address-save-btn"
              disabled={saving}
            >
              {saving
                ? "Đang lưu..."
                : address
                  ? "Lưu thay đổi"
                  : "Thêm địa chỉ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddressCard({ address, onEdit, onDelete, onSetDefault }) {
  return (
    <div className={`address-card ${address.isDefault ? "default" : ""}`}>
      <div className="address-card-top">
        <div className="address-card-type">
          <div className="address-type-icon">
            <Home size={19} />
          </div>

          <div>
            <h3>Địa chỉ giao hàng</h3>

            {address.isDefault && (
              <span className="address-default-badge">
                <Star size={12} fill="currentColor" />
                Mặc định
              </span>
            )}
          </div>
        </div>

        <div className="address-card-actions">
          <button onClick={onEdit} title="Chỉnh sửa" aria-label="Chỉnh sửa">
            <Pencil size={16} />
          </button>

          <button
            onClick={onDelete}
            title="Xóa địa chỉ"
            aria-label="Xóa địa chỉ"
            className="address-delete-action"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="address-card-divider" />

      <div className="address-recipient">
        <UserRound size={16} />
        <strong>{address.name}</strong>
        <span className="address-recipient-separator">|</span>
        <Phone size={14} />
        <span>{address.phone}</span>
      </div>

      <div className="address-location">
        <MapPin size={17} />
        <p>
          {address.address}, {address.ward}, {address.district},{" "}
          {address.city}
        </p>
      </div>

      {!address.isDefault && (
        <button
          className="address-set-default"
          onClick={onSetDefault}
        >
          Đặt làm mặc định
        </button>
      )}
    </div>
  );
}

export default function Addresses() {
  const [addresses, setAddresses] = useState([]);
  const [editingAddress, setEditingAddress] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Lấy danh sách địa chỉ từ Backend
  const fetchAddresses = useCallback(async () => {
    try {
      setError("");
      const response = await api.get("/addresses");

      const data = response.data.data || [];
      setAddresses(data.map(mapAddress));
    } catch (err) {
      console.error("Get addresses error:", err);
      setError(
        err.response?.data?.message ||
          "Không thể tải danh sách địa chỉ."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const openAddModal = () => {
    setEditingAddress(null);
    setIsAdding(true);
  };

  const openEditModal = (address) => {
    setEditingAddress(address);
    setIsAdding(false);
  };

  const closeModal = () => {
    setEditingAddress(null);
    setIsAdding(false);
  };

  // Thêm hoặc cập nhật địa chỉ
  const saveAddress = async (payload) => {
    try {
      if (editingAddress) {
        await api.put(
          `/addresses/${editingAddress.id}`,
          payload
        );
      } else {
        await api.post("/addresses", payload);
      }

      closeModal();
      await fetchAddresses();
    } catch (err) {
      console.error("Save address error:", err);
      alert(
        err.response?.data?.message ||
          "Không thể lưu địa chỉ. Vui lòng thử lại."
      );
      throw err;
    }
  };

  // Đặt địa chỉ mặc định
  const setDefaultAddress = async (id) => {
    try {
      await api.patch(`/addresses/${id}/default`);
      await fetchAddresses();
    } catch (err) {
      console.error("Set default address error:", err);
      alert(
        err.response?.data?.message ||
          "Không thể đặt địa chỉ mặc định."
      );
    }
  };

  // Xóa địa chỉ
  const deleteAddress = async (id) => {
    const shouldDelete = window.confirm(
      "Bạn có chắc chắn muốn xóa địa chỉ này?"
    );

    if (!shouldDelete) return;

    try {
      await api.delete(`/addresses/${id}`);
      await fetchAddresses();
    } catch (err) {
      console.error("Delete address error:", err);
      alert(
        err.response?.data?.message ||
          "Không thể xóa địa chỉ."
      );
    }
  };

  return (
    <div className="addresses-page">
      <div className="addresses-heading">
        <div>
          <span className="addresses-eyebrow">TÀI KHOẢN CỦA BẠN</span>
          <h1>Địa chỉ giao hàng</h1>
          <p>
            Quản lý địa chỉ nhận hàng cho những đơn mua trên CraftUp.
          </p>
        </div>

        <button className="address-add-btn" onClick={openAddModal}>
          <Plus size={18} />
          Thêm địa chỉ mới
        </button>
      </div>

      <div className="addresses-info">
        <MapPin size={19} />
        <p>
          Bạn có thể lưu nhiều địa chỉ và chọn một địa chỉ mặc định
          để thuận tiện hơn khi đặt hàng.
        </p>
      </div>

      <div className="addresses-list-heading">
        <h2>Địa chỉ đã lưu</h2>
        <span>{addresses.length} địa chỉ</span>
      </div>

      {loading ? (
        <p>Đang tải danh sách địa chỉ...</p>
      ) : error ? (
        <div className="addresses-empty">
          <p>{error}</p>
          <button onClick={fetchAddresses}>Thử lại</button>
        </div>
      ) : addresses.length > 0 ? (
        <div className="addresses-grid">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={() => openEditModal(address)}
              onDelete={() => deleteAddress(address.id)}
              onSetDefault={() => setDefaultAddress(address.id)}
            />
          ))}
        </div>
      ) : (
        <div className="addresses-empty">
          <div>
            <MapPin size={34} />
          </div>
          <h3>Bạn chưa có địa chỉ giao hàng</h3>
          <p>
            Thêm địa chỉ để thuận tiện hơn khi đặt mua sản phẩm.
          </p>
          <button onClick={openAddModal}>
            <Plus size={17} />
            Thêm địa chỉ đầu tiên
          </button>
        </div>
      )}

      {(isAdding || editingAddress) && (
        <AddressModal
          address={editingAddress}
          onClose={closeModal}
          onSave={saveAddress}
        />
      )}
    </div>
  );
}
