
export interface Shop {
  id?: string;
  name: string;
  description: string | null;
  logo: string | null;
  rating: number | null;
  review_count: number | null;
  owner_id: string;
}

export interface ShopFormProps {
  shop: Shop | null;
  onSave: (shop: Shop) => void;
  onCancel: () => void;
}
