// 지원 도시 목록 (한글명 ↔ OpenWeather 조회용 영문명 + 좌표)
// 강의 p199의 도시명/좌표 기반 조회 방식에 맞춤
export const CITIES = [
  { id: 'seoul', ko: '서울', en: 'Seoul', lat: 37.5665, lon: 126.978 },
  { id: 'busan', ko: '부산', en: 'Busan', lat: 35.1796, lon: 129.0756 },
  { id: 'incheon', ko: '인천', en: 'Incheon', lat: 37.4563, lon: 126.7052 },
  { id: 'daegu', ko: '대구', en: 'Daegu', lat: 35.8714, lon: 128.6014 },
  { id: 'daejeon', ko: '대전', en: 'Daejeon', lat: 36.3504, lon: 127.3845 },
  { id: 'gwangju', ko: '광주', en: 'Gwangju', lat: 35.1595, lon: 126.8526 },
  { id: 'suwon', ko: '수원', en: 'Suwon', lat: 37.2636, lon: 127.0286 },
  { id: 'jeju', ko: '제주', en: 'Jeju', lat: 33.4996, lon: 126.5312 },
  { id: 'gangneung', ko: '강릉', en: 'Gangneung', lat: 37.7519, lon: 128.8761 },
  { id: 'ulsan', ko: '울산', en: 'Ulsan', lat: 35.5384, lon: 129.3114 },
]

export const findCityById = (id) => CITIES.find((c) => c.id === id)
export const findCityByName = (name) =>
  CITIES.find((c) => c.ko === name || c.en.toLowerCase() === String(name).toLowerCase())
