// شعارات المحافظ التي يُدفع إليها (المعرّفات والأسماء كما في لوحة التحكم ← الإرشاد ← الإعدادات)
import palpay from '@/assets/images/wallets/palpay.svg'
import jawwalpay from '@/assets/images/wallets/jawwalpay.png'

const LOGOS = { palpay, jawwalpay }
const BY_NAME = { 'بال باي': 'palpay', 'جوال باي': 'jawwalpay' }

export const walletLogo = (idOrName) => LOGOS[idOrName] ?? LOGOS[BY_NAME[idOrName]] ?? null
