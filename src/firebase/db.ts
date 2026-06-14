import {
  getDatabase,
  ref,
  onValue,
  push,
  update,
  remove,
  get,
  query,
  orderByChild,
  equalTo,
} from '@react-native-firebase/database';
import {
  ShoppingItem,
  Recipe,
  TreffitProposal,
  AppNotification,
  ListItem,
  UserId,
} from '../types';

const db = () => getDatabase();

// ─── Shopping list ────────────────────────────────────────────────────────────

export function watchShoppingList(
  onUpdate: (items: ShoppingItem[]) => void,
): () => void {
  const r = ref(db(), '/shared/kauppalista');
  return onValue(r, snapshot => {
    const val = snapshot.val();
    const items: ShoppingItem[] = val
      ? Object.entries(val).map(([id, d]) => ({ id, ...(d as any) }))
      : [];
    items.sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0));
    onUpdate(items);
  }, (error: Error) => {
    console.error('[watchShoppingList] Firebase error:', error.message);
    onUpdate([]);
  });
}

export async function addShoppingItem(
  item: Omit<ShoppingItem, 'id'>,
): Promise<void> {
  await push(ref(db(), '/shared/kauppalista'), item);
}

export async function toggleShoppingItem(
  id: string,
  done: boolean,
): Promise<void> {
  await update(ref(db(), `/shared/kauppalista/${id}`), { done });
}

export async function deleteShoppingItem(id: string): Promise<void> {
  await remove(ref(db(), `/shared/kauppalista/${id}`));
}

export async function clearDoneItems(): Promise<void> {
  const snapshot = await get(ref(db(), '/shared/kauppalista'));
  const val = snapshot.val();
  if (!val) return;
  const updates: Record<string, null> = {};
  Object.entries(val).forEach(([id, item]) => {
    if ((item as any).done) updates[`/shared/kauppalista/${id}`] = null;
  });
  await update(ref(db(), '/'), updates);
}

// ─── Recipes ──────────────────────────────────────────────────────────────────

export function watchRecipes(
  onUpdate: (recipes: Recipe[]) => void,
): () => void {
  const r = ref(db(), '/shared/reseptit');
  return onValue(r, snapshot => {
    const val = snapshot.val();
    const recipes: Recipe[] = val
      ? Object.entries(val).map(([id, d]) => {
          const data = d as any;
          return {
            id,
            ...data,
            ingredients: data.ingredients
              ? Object.values(data.ingredients as Record<string, string>)
              : [],
          };
        })
      : [];
    recipes.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
    onUpdate(recipes);
  });
}

export async function addRecipe(recipe: Omit<Recipe, 'id'>): Promise<void> {
  const { ingredients, ...rest } = recipe;
  const ingredientsObj = ingredients.reduce<Record<string, string>>(
    (acc, ing, i) => ({ ...acc, [i]: ing }),
    {},
  );
  await push(ref(db(), '/shared/reseptit'), { ...rest, ingredients: ingredientsObj });
}

export async function deleteRecipe(id: string): Promise<void> {
  await remove(ref(db(), `/shared/reseptit/${id}`));
}

export async function seedDefaultRecipes(): Promise<void> {
  const snapshot = await get(ref(db(), '/shared/reseptit'));
  if (snapshot.exists()) return;

  const defaults: Omit<Recipe, 'id'>[] = [
    {
      name: 'Pasta Carbonara',
      emoji: '🍝',
      category: 'Pasta',
      time: '25 min',
      ingredients: ['400 g spagetti', '150 g pancetta tai pekoni', '3 munaa + 1 keltuainen', '80 g pecorino tai parmesan', 'Suolaa ja mustapippuria'],
      instructions: 'Keitä pasta runsaasti suolatussa vedessä al denteksi. Paista pancetta kuivalla pannulla rapeaksi.\n\nVatkaa kulhossa munat, keltuainen ja juusto + reilusti pippuria. Kaada pasta pannulle (ei lämmölle!), lisää pancetta ja rasva. Kaada munasoossi päälle ja sekoita reippaasti. Lisää pasta-vettä tarvittaessa.',
      addedBy: 'jasper',
      addedAt: Date.now(),
    },
    {
      name: 'Lohikeitto',
      emoji: '🐟',
      category: 'Keitto',
      time: '40 min',
      ingredients: ['500 g lohifileetä', '4 perunaa', '1 sipuli', '2 dl kuohukermaa', '1 l vettä', '1 liemikuutio', 'Tilliä ja suolaa'],
      instructions: 'Kuori ja kuutioi perunat, hienonna sipuli. Keitä liemessä pehmeiksi (n. 15 min). Leikkaa lohi kuutioiksi ja lisää keittoon – keitä 5 min. Lisää kerma ja anna kiehahtaa. Mausta suolalla. Tarjoile tuoreen tillin kanssa!',
      addedBy: 'jasper',
      addedAt: Date.now() + 1,
    },
    {
      name: 'Pannukakku',
      emoji: '🥞',
      category: 'Jälkiruoka',
      time: '30 min',
      ingredients: ['3 dl vehnäjauhoja', '6 dl maitoa', '3 munaa', '1 rkl sokeria', '½ tl suolaa', '2 rkl voita (sulatettuna)'],
      instructions: 'Sekoita jauhot, sokeri ja suola. Vatkaa joukkoon munat ja maito vähitellen. Lisää sulatettu voi. Kaada taikina voidellulle uunipellille. Paista 200°C noin 25 min. Tarjoile mansikkahillon ja kermavaahdon kanssa!',
      addedBy: 'jasper',
      addedAt: Date.now() + 2,
    },
    {
      name: 'Smoothie Bowl',
      emoji: '🍓',
      category: 'Aamupala',
      time: '10 min',
      ingredients: ['2 pakastettua banaania', '200 g pakastemarjoja', '1 dl kauramaitoa', 'Granolaa', 'Tuoreita marjoja', 'Hunajaa'],
      instructions: 'Laita blenderiin pakastetut banaanit, marjat ja kauramaito. Blendaa paksuksi. Kaada kulhoon. Lisää päälle granolaa, tuoreita marjoja ja hunajaa.',
      addedBy: 'jasper',
      addedAt: Date.now() + 3,
    },
    {
      name: 'Kanacurry',
      emoji: '🍛',
      category: 'Pääruoka',
      time: '35 min',
      ingredients: ['500 g kanafileetä', '1 sipuli', '3 valkosipulinkynttä', '400 ml kookosmaito', '2 rkl currymaustetta', '1 tl kurkumaa', 'Basmati-riisiä'],
      instructions: 'Silppua sipuli ja valkosipuli, paista öljyssä pehmeiksi. Lisää curry ja kurkuma, paista hetki. Lisää paloiteltu kana ja ruskista. Kaada kookosmaito, keitä hiljalleen 20 min. Tarjoile riisin kanssa.',
      addedBy: 'jasper',
      addedAt: Date.now() + 4,
    },
  ];

  const batch: Record<string, any> = {};
  defaults.forEach(recipe => {
    const { ingredients, ...rest } = recipe;
    const ingredientsObj = ingredients.reduce<Record<string, string>>(
      (acc, ing, i) => ({ ...acc, [i]: ing }),
      {},
    );
    const key = push(ref(db(), '/shared/reseptit')).key!;
    batch[`/shared/reseptit/${key}`] = { ...rest, ingredients: ingredientsObj };
  });

  await update(ref(db(), '/'), batch);
}

// ─── Treffit proposals ────────────────────────────────────────────────────────

export function watchTreffitProposals(
  onUpdate: (proposals: TreffitProposal[]) => void,
): () => void {
  const r = ref(db(), '/shared/treffit');
  return onValue(r, snapshot => {
    const val = snapshot.val();
    const proposals: TreffitProposal[] = val
      ? Object.entries(val).map(([id, d]) => ({ id, ...(d as any) }))
      : [];
    proposals.sort((a, b) => (b.proposedAt || 0) - (a.proposedAt || 0));
    onUpdate(proposals);
  });
}

export async function proposeTreffit(
  proposal: Omit<TreffitProposal, 'id'>,
): Promise<void> {
  await push(ref(db(), '/shared/treffit'), proposal);
}

export async function updateTreffitStatus(
  id: string,
  status: 'confirmed' | 'declined',
): Promise<void> {
  await update(ref(db(), `/shared/treffit/${id}`), { status });
}

// ─── Notifications ────────────────────────────────────────────────────────────

export function watchNotifications(
  userId: UserId,
  onUpdate: (notifications: AppNotification[]) => void,
): () => void {
  const r = query(ref(db(), '/notifications'), orderByChild('to'), equalTo(userId));
  return onValue(r, snapshot => {
    const val = snapshot.val();
    const notifications: AppNotification[] = val
      ? Object.entries(val).map(([id, d]) => ({ id, ...(d as any) }))
      : [];
    notifications.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    onUpdate(notifications);
  });
}

export async function sendNotification(
  notif: Omit<AppNotification, 'id'>,
): Promise<void> {
  await push(ref(db(), '/notifications'), notif);
}

export async function markNotificationRead(
  id: string,
  userId: UserId,
): Promise<void> {
  await update(ref(db(), `/notifications/${id}/read/${userId}`), { [userId]: true });
}

// ─── FCM tokens ───────────────────────────────────────────────────────────────

export async function saveFcmToken(userId: UserId, token: string): Promise<void> {
  await update(ref(db(), `/users/${userId}`), { fcmToken: token, lastSeen: Date.now() });
}

// ─── Leffalista ────────────────────────────────────────────────────────────────

export function watchLeffalista(
  onUpdate: (items: ListItem[]) => void,
): () => void {
  const r = ref(db(), '/shared/leffalista');
  return onValue(r, snapshot => {
    const val = snapshot.val();
    const items: ListItem[] = val
      ? Object.entries(val).map(([id, d]) => ({ id, ...(d as any) }))
      : [];
    items.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
    onUpdate(items);
  }, (error: Error) => {
    console.error('[watchLeffalista] Firebase error:', error.message);
    onUpdate([]);
  });
}

export async function addLeffaItem(item: Omit<ListItem, 'id'>): Promise<void> {
  await push(ref(db(), '/shared/leffalista'), item);
}

export async function deleteLeffaItem(id: string): Promise<void> {
  await remove(ref(db(), `/shared/leffalista/${id}`));
}

// ─── Kohdelista ────────────────────────────────────────────────────────────────

export function watchKohdelista(
  onUpdate: (items: ListItem[]) => void,
): () => void {
  const r = ref(db(), '/shared/kohdelista');
  return onValue(r, snapshot => {
    const val = snapshot.val();
    const items: ListItem[] = val
      ? Object.entries(val).map(([id, d]) => ({ id, ...(d as any) }))
      : [];
    items.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
    onUpdate(items);
  }, (error: Error) => {
    console.error('[watchKohdelista] Firebase error:', error.message);
    onUpdate([]);
  });
}

export async function addKohdeItem(item: Omit<ListItem, 'id'>): Promise<void> {
  await push(ref(db(), '/shared/kohdelista'), item);
}

export async function deleteKohdeItem(id: string): Promise<void> {
  await remove(ref(db(), `/shared/kohdelista/${id}`));
}
