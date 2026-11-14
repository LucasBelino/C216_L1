from app.models.item import Item
from app.repositories.item import ItemRepository
from app.schemas.item import ItemCreate, ItemPatch, ItemUpdate


class ItemNotFoundError(Exception):
    def __init__(self, item_id: int) -> None:
        super().__init__(f"Item {item_id} não encontrado")
        self.item_id = item_id


class ItemAlreadyExistsError(Exception):
    def __init__(self, name: str) -> None:
        super().__init__("Já existe um item com esse nome")
        self.name = name


class ItemService:
    """Regras de negócio dos itens."""

    def __init__(self, repository: ItemRepository) -> None:
        self.repository = repository

    def list_items(self, limit: int = 10, offset: int = 0) -> list[Item]:
        return self.repository.get_all(limit=limit, offset=offset)

    def get_item(self, item_id: int) -> Item:
        item = self.repository.get_by_id(item_id)
        if item is None:
            raise ItemNotFoundError(item_id)
        return item

    def create_item(self, data: ItemCreate) -> Item:
        self._ensure_unique_name(data.name)
        return self.repository.create(Item(**data.model_dump()))

    def replace_item(self, item_id: int, data: ItemUpdate) -> Item:
        item = self.get_item(item_id)
        self._ensure_unique_name(data.name, item_id)
        for field, value in data.model_dump().items():
            setattr(item, field, value)
        return self.repository.update(item)

    def update_item(self, item_id: int, data: ItemPatch) -> Item:
        item = self.get_item(item_id)
        changes = data.model_dump(exclude_unset=True)
        if "name" in changes:
            self._ensure_unique_name(changes["name"], item_id)
        for field, value in changes.items():
            setattr(item, field, value)
        return self.repository.update(item)

    def delete_item(self, item_id: int) -> None:
        item = self.get_item(item_id)
        self.repository.delete(item)

    def _ensure_unique_name(self, name: str, item_id: int | None = None) -> None:
        existing = self.repository.get_by_name(name)
        if existing is not None and existing.id != item_id:
            raise ItemAlreadyExistsError(name)
