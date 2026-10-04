from app.schemas.item import ItemCreate, ItemPatch, ItemRead, ItemUpdate


class ItemNotFoundError(Exception):
    def __init__(self, item_id: int) -> None:
        super().__init__(f"Item {item_id} não encontrado")
        self.item_id = item_id


class ItemService:
    """Regras de negócio dos itens, com armazenamento em memória."""

    def __init__(self) -> None:
        self._items: dict[int, ItemRead] = {}
        self._next_id = 1

    def list_items(self, limit: int = 10, offset: int = 0) -> list[ItemRead]:
        items = list(self._items.values())
        return items[offset : offset + limit]

    def get_item(self, item_id: int) -> ItemRead:
        if item_id not in self._items:
            raise ItemNotFoundError(item_id)
        return self._items[item_id]

    def create_item(self, data: ItemCreate) -> ItemRead:
        item = ItemRead(id=self._next_id, **data.model_dump())
        self._items[item.id] = item
        self._next_id += 1
        return item

    def replace_item(self, item_id: int, data: ItemUpdate) -> ItemRead:
        self.get_item(item_id)
        item = ItemRead(id=item_id, **data.model_dump())
        self._items[item_id] = item
        return item

    def update_item(self, item_id: int, data: ItemPatch) -> ItemRead:
        current = self.get_item(item_id)
        changes = data.model_dump(exclude_unset=True)
        item = current.model_copy(update=changes)
        self._items[item_id] = item
        return item

    def delete_item(self, item_id: int) -> None:
        self.get_item(item_id)
        del self._items[item_id]


_item_service = ItemService()


def get_item_service() -> ItemService:
    return _item_service
