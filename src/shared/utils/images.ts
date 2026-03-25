/**
 * 图片工具函数
 * 使用免费图片资源生成图片URL
 */

/**
 * 获取 Unsplash 图片URL
 */
export function getUnsplashImage(width: number = 400, height: number = 300, seed: string | null = null): string {
  if (seed && typeof seed === 'string') {
    const keywords = seed.split(',').map(k => k.trim()).join(',')
    return `https://source.unsplash.com/${width}x${height}/?${keywords}`
  }
  return `https://source.unsplash.com/random/${width}x${height}`
}

/**
 * 获取 Picsum 图片URL
 */
export function getPicsumImage(width: number = 400, height: number = 300, id: number | null = null): string {
  if (id) {
    return `https://picsum.photos/id/${id}/${width}/${height}`
  }
  return `https://picsum.photos/${width}/${height}?random=${Math.floor(Math.random() * 1000)}`
}

/**
 * 获取占位图URL
 */
export function getPlaceholderImage(width: number = 400, height: number = 300, text: string = ''): string {
  const textParam = text ? `&text=${encodeURIComponent(text)}` : ''
  return `https://via.placeholder.com/${width}x${height}${textParam}`
}

/**
 * 获取物品图片（根据物品类型返回合适的图片）
 */
export function getItemImage(itemType: string, width: number = 400, height: number = 300): string {
  const imageMap: Record<string, string> = {
    // 电子产品
    'power bank': 'electronics,power,charger',
    '充电宝': 'electronics,power,charger',
    'laptop': 'laptop,computer,technology',
    '笔记本': 'laptop,computer,technology',
    'stand': 'laptop,stand,desk',
    '支架': 'laptop,stand,desk',
    'calculator': 'calculator,math,device',
    '计算器': 'calculator,math,device',
    
    // 图书
    'book': 'book,reading,study',
    'textbook': 'book,textbook,education',
    '教材': 'book,textbook,education',
    'physics': 'book,science,physics',
    '物理': 'book,science,physics',
    
    // 运动器材
    'badminton': 'sports,badminton,racket',
    '羽毛球': 'sports,badminton,racket',
    'yoga': 'yoga,mat,fitness',
    '瑜伽': 'yoga,mat,fitness',
    
    // 生活用品
    'thermos': 'bottle,thermos,water',
    '暖水瓶': 'bottle,thermos,water',
    'bottle': 'bottle,water,drink',
    
    // 其他
    'camera': 'camera,photography,dslr',
    '相机': 'camera,photography,dslr',
    'projector': 'projector,technology,device',
    '投影仪': 'projector,technology,device',
    'scooter': 'scooter,electric,transport',
    '滑板车': 'scooter,electric,transport',
    'tripod': 'tripod,camera,photography',
    '三脚架': 'tripod,camera,photography',
    'switch': 'gaming,console,nintendo',
    '游戏机': 'gaming,console,nintendo',
    'scale': 'scale,weight,health',
    '体重秤': 'scale,weight,health',
    'speaker': 'speaker,audio,music',
    '音箱': 'speaker,audio,music',
    'bicycle': 'bicycle,bike,transport',
    '自行车': 'bicycle,bike,transport',
    'purifier': 'air,purifier,clean',
    '净化器': 'air,purifier,clean'
  }
  
  const keyword = Object.keys(imageMap).find(key => 
    itemType.toLowerCase().includes(key.toLowerCase())
  )
  
  if (keyword) {
    return getUnsplashImage(width, height, imageMap[keyword])
  }
  
  return getPicsumImage(width, height, Math.floor(Math.random() * 1000))
}

/**
 * 获取用户头像
 * 使用 UI Avatars 服务生成头像
 */
export function getUserAvatar(userId: string | number | null = null, size: number = 200, name: string = '用户'): string {
  // 使用 UI Avatars API 生成字母头像
  const colors = ['3b82f6', '8b5cf6', 'ec4899', 'f59e0b', '10b981', '06b6d4', 'f43f5e', '84cc16']
  
  let colorIndex = 0
  if (userId) {
    const id = typeof userId === 'string' 
      ? userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      : userId
    colorIndex = id % colors.length
  } else {
    colorIndex = Math.floor(Math.random() * colors.length)
  }
  
  const backgroundColor = colors[colorIndex]
  const firstLetter = name.charAt(0).toUpperCase()
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(firstLetter)}&size=${size}&background=${backgroundColor}&color=fff&bold=true`
}

/**
 * 获取默认图片
 */
export function getDefaultImage(type: 'item' | 'avatar' | 'banner' = 'item', width: number = 400, height: number = 300): string {
  switch (type) {
    case 'avatar':
      return getUserAvatar(null, width)
    case 'banner':
      return getUnsplashImage(width, height, 'campus,university,education')
    case 'item':
    default:
      return getPicsumImage(width, height)
  }
}

/**
 * 图片预加载
 */
export function preloadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

/**
 * 批量预加载图片
 */
export function preloadImages(urls: string[]): Promise<(HTMLImageElement | null)[]> {
  return Promise.all(urls.map(url => preloadImage(url).catch(() => null)))
}
