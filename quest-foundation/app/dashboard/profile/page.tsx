'use client'

import { useEffect, useState, ChangeEvent, FormEvent } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Save, X, Upload } from 'lucide-react'
import Image from 'next/image'

const COUNTRY_STATE_OPTIONS: Record<string, string[]> = {
  Afghanistan: ['Kabul', 'Kandahar', 'Herat', 'Mazar-i-Sharif'],
  Albania: ['Tirana', 'Durres', 'Vlore', 'Shkoder'],
  Algeria: ['Algiers', 'Oran', 'Constantine', 'Annaba'],
  Andorra: ['Andorra la Vella', 'Escaldes-Engordany'],
  Angola: ['Luanda', 'Huambo', 'Benguela', 'Cabinda'],
  Argentina: ['Buenos Aires', 'Cordoba', 'Rosario', 'Mendoza', 'La Plata'],
  Armenia: ['Yerevan', 'Gumri', 'Vanadzor'],
  Australia: ['New South Wales', 'Victoria', 'Queensland', 'South Australia', 'Western Australia', 'Tasmania', 'ACT'],
  Austria: ['Vienna', 'Graz', 'Linz', 'Salzburg', 'Innsbruck'],
  Azerbaijan: ['Baku', 'Ganja', 'Sumgait', 'Quba'],
  Bahamas: ['Nassau', 'Freeport', 'Marsh Harbour'],
  Bahrain: ['Manama', 'Riffa', 'Muharraq'],
  Bangladesh: ['Dhaka', 'Chittagong', 'Khulna', 'Rajshahi', 'Sylhet'],
  Barbados: ['Bridgetown', 'Speightstown', 'Oistins'],
  Belarus: ['Minsk', 'Brest', 'Vitebsk', 'Gomel'],
  Belgium: ['Brussels', 'Antwerp', 'Ghent', 'Charleroi', 'Liege'],
  Belize: ['Belize City', 'San Ignacio', 'Orange Walk'],
  Benin: ['Porto-Novo', 'Cotonou', 'Parakou'],
  Bhutan: ['Thimphu', 'Paro', 'Punakha'],
  Bolivia: ['La Paz', 'Santa Cruz', 'Cochabamba', 'Sucre'],
  'Bosnia and Herzegovina': ['Sarajevo', 'Banja Luka', 'Zenica', 'Tuzla'],
  Botswana: ['Gaborone', 'Francistown', 'Molepolole'],
  Brazil: ['Sao Paulo', 'Rio de Janeiro', 'Bahia', 'Minas Gerais', 'Parana', 'Santa Catarina', 'Rio Grande do Sul'],
  Brunei: ['Bandar Seri Begawan', 'Kuala Belait'],
  Bulgaria: ['Sofia', 'Plovdiv', 'Varna', 'Burgas'],
  'Burkina Faso': ['Ouagadougou', 'Bobo-Dioulasso', 'Koudougou'],
  Burundi: ['Gitega', 'Bujumbura'],
  Cambodia: ['Phnom Penh', 'Siem Reap', 'Battambang', 'Sihanoukville'],
  Cameroon: ['Yaounde', 'Douala', 'Garoua', 'Buea'],
  Canada: ['Ontario', 'Quebec', 'British Columbia', 'Alberta', 'Manitoba', 'Saskatchewan', 'Nova Scotia', 'Prince Edward Island', 'Newfoundland and Labrador'],
  'Cape Verde': ['Praia', 'Mindelo'],
  'Central African Republic': ['Bangui', 'Berberati', 'Bouar'],
  Chad: ['NDjamena', 'Sarh', 'Moundou'],
  Chile: ['Santiago', 'Valparaiso', 'Concepcion', 'Valdivia'],
  China: ['Beijing', 'Shanghai', 'Guangdong', 'Sichuan', 'Jiangsu', 'Zhejiang', 'Hunan', 'Anhui'],
  Colombia: ['Bogota', 'Medellin', 'Cali', 'Barranquilla', 'Cartagena'],
  Comoros: ['Moroni', 'Mutsamudu'],
  Congo: ['Brazzaville', 'Pointe-Noire'],
  'Costa Rica': ['San Jose', 'Alajuela', 'Cartago', 'Puntarenas'],
  'Cote dIvoire': ['Yamoussoukro', 'Abidjan', 'Bouake'],
  Croatia: ['Zagreb', 'Split', 'Rijeka', 'Osijek'],
  Cuba: ['Havana', 'Santiago de Cuba', 'Camaguey'],
  Cyprus: ['Nicosia', 'Limassol', 'Larnaca'],
  'Czech Republic': ['Prague', 'Brno', 'Ostrava', 'Plzen'],
  Denmark: ['Copenhagen', 'Aarhus', 'Odense', 'Aalborg'],
  Djibouti: ['Djibouti City', 'Arta'],
  Dominica: ['Roseau', 'Portsmouth'],
  'Dominican Republic': ['Santo Domingo', 'Santiago', 'Puerto Plata'],
  Ecuador: ['Quito', 'Guayaquil', 'Cuenca', 'Ambato'],
  Egypt: ['Cairo', 'Alexandria', 'Giza', 'Aswan', 'Luxor'],
  'El Salvador': ['San Salvador', 'Santa Ana', 'San Miguel'],
  'Equatorial Guinea': ['Malabo', 'Bata'],
  Eritrea: ['Asmara', 'Assab'],
  Estonia: ['Tallinn', 'Tartu', 'Narva', 'Parnu'],
  Ethiopia: ['Addis Ababa', 'Dire Dawa', 'Adama'],
  Fiji: ['Suva', 'Nadi', 'Lautoka'],
  Finland: ['Helsinki', 'Espoo', 'Tampere', 'Turku'],
  France: ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Provence-Alpes-Cote d Azur', 'Rhone-Alpes'],
  Gabon: ['Libreville', 'Port-Gentil'],
  Gambia: ['Banjul', 'Serekunda'],
  Georgia: ['Tbilisi', 'Kutaisi', 'Batumi', 'Gori'],
  Germany: ['Berlin', 'Munich', 'Hamburg', 'Cologne', 'Frankfurt', 'Stuttgart', 'Dusseldorf'],
  Ghana: ['Accra', 'Kumasi', 'Takoradi', 'Sekondi'],
  Greece: ['Athens', 'Thessaloniki', 'Patras', 'Heraklion'],
  Grenada: ['St Georges', 'Gouyave'],
  Guatemala: ['Guatemala City', 'Quetzaltenango', 'Antigua'],
  Guinea: ['Conakry', 'Kindia', 'Mamou'],
  'Guinea-Bissau': ['Bissau', 'Bafata'],
  Guyana: ['Georgetown', 'Linden', 'New Amsterdam'],
  Haiti: ['Port-au-Prince', 'Cap-Haitien', 'Jacmel'],
  Honduras: ['Tegucigalpa', 'San Pedro Sula', 'La Ceiba'],
  'Hong Kong': ['Hong Kong Island', 'Kowloon', 'New Territories'],
  Hungary: ['Budapest', 'Debrecen', 'Szeged', 'Pecs'],
  Iceland: ['Reykjavik', 'Kopavogur', 'Hafnarfjordur'],
  India: ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Puducherry', 'Ladakh', 'Jammu and Kashmir'],
  Indonesia: ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang', 'Makassar', 'Palembang'],
  Iran: ['Tehran', 'Isfahan', 'Mashhad', 'Tabriz', 'Shiraz'],
  Iraq: ['Baghdad', 'Basra', 'Mosul', 'Erbil'],
  Ireland: ['Dublin', 'Cork', 'Limerick', 'Galway'],
  Israel: ['Jerusalem', 'Tel Aviv', 'Haifa', 'Beer Sheva'],
  Italy: ['Rome', 'Milan', 'Naples', 'Turin', 'Venice', 'Florence'],
  Jamaica: ['Kingston', 'Montego Bay', 'Spanish Town'],
  Japan: ['Tokyo', 'Osaka', 'Yokohama', 'Kyoto', 'Nagoya', 'Sapporo'],
  Jordan: ['Amman', 'Zarqa', 'Irbid', 'Aqaba'],
  Kazakhstan: ['Nur-Sultan', 'Almaty', 'Karaganda', 'Shymkent'],
  Kenya: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru'],
  Kiribati: ['Tarawa', 'Butaritari'],
  Kuwait: ['Kuwait City', 'Al Ahmadi', 'Hawalli'],
  Kyrgyzstan: ['Bishkek', 'Osh', 'Jalal-Abad'],
  Laos: ['Vientiane', 'Luang Prabang', 'Savannakhet'],
  Latvia: ['Riga', 'Daugavpils', 'Liepaja'],
  Lebanon: ['Beirut', 'Tripoli', 'Sidon', 'Tyre'],
  Lesotho: ['Maseru', 'Teyateyaneng'],
  Liberia: ['Monrovia', 'Gbarnga', 'Kakata'],
  Libya: ['Tripoli', 'Benghazi', 'Misrata'],
  Liechtenstein: ['Vaduz', 'Schaan'],
  Lithuania: ['Vilnius', 'Kaunas', 'Klaipeda'],
  Luxembourg: ['Luxembourg City', 'Esch-sur-Alzette'],
  Macao: ['Macao City', 'Taipa'],
  Madagascar: ['Antananarivo', 'Toliara', 'Antsirabe'],
  Malawi: ['Lilongwe', 'Blantyre', 'Mzuzu'],
  Malaysia: ['Kuala Lumpur', 'George Town', 'Ipoh', 'Klang', 'Johor Bahru'],
  Maldives: ['Male', 'Addu City'],
  Mali: ['Bamako', 'Segou', 'Mopti'],
  Malta: ['Valletta', 'Sliema', 'Mosta'],
  'Marshall Islands': ['Majuro', 'Ebeye'],
  Mauritania: ['Nouakchott', 'Nouadhibou'],
  Mauritius: ['Port Louis', 'Beau Bassin-Rose Hill'],
  Mexico: ['Mexico City', 'Ecatepec', 'Guadalajara', 'Monterrey', 'Puebla', 'Cancun'],
  Micronesia: ['Palikir', 'Kolonia'],
  Moldova: ['Chisinau', 'Tiraspol', 'Balti'],
  Monaco: ['Monaco-Ville', 'La Rousse'],
  Mongolia: ['Ulaanbaatar', 'Darkhan', 'Erdenet'],
  Montenegro: ['Podgorica', 'Cetinje', 'Niksic'],
  Morocco: ['Rabat', 'Casablanca', 'Fes', 'Marrakech', 'Tangier'],
  Mozambique: ['Maputo', 'Beira', 'Nampula'],
  Myanmar: ['Naypyidaw', 'Yangon', 'Mandalay', 'Bagan'],
  Namibia: ['Windhoek', 'Walvis Bay', 'Swakopmund'],
  Nauru: ['Yaren', 'Nauru'],
  Nepal: ['Kathmandu', 'Pokhara', 'Biratnagar', 'Lalitpur'],
  Netherlands: ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven'],
  'New Zealand': ['Auckland', 'Wellington', 'Christchurch', 'Hamilton'],
  Nicaragua: ['Managua', 'Leon', 'Granada'],
  Niger: ['Niamey', 'Zinder', 'Maradi'],
  Nigeria: ['Lagos', 'Abuja', 'Kano', 'Ibadan', 'Port Harcourt'],
  'North Korea': ['Pyongyang', 'Kaesong', 'Nampo'],
  'North Macedonia': ['Skopje', 'Bitola', 'Tetovo'],
  Norway: ['Oslo', 'Bergen', 'Trondheim', 'Stavanger'],
  Oman: ['Muscat', 'Salalah', 'Nizwa'],
  Pakistan: ['Islamabad', 'Karachi', 'Lahore', 'Rawalpindi', 'Multan', 'Hyderabad'],
  Palau: ['Ngerulmud', 'Koror'],
  Palestine: ['Ramallah', 'Gaza City', 'Hebron'],
  Panama: ['Panama City', 'San Miguelito', 'Colon'],
  'Papua New Guinea': ['Port Moresby', 'Lae', 'Madang'],
  Paraguay: ['Asuncion', 'Ciudad del Este', 'Concepcion'],
  Peru: ['Lima', 'Arequipa', 'Cusco', 'Trujillo'],
  Philippines: ['Manila', 'Quezon City', 'Cebu', 'Davao', 'Caloocan'],
  Poland: ['Warsaw', 'Krakow', 'Wroclaw', 'Poznan', 'Gdansk'],
  Portugal: ['Lisbon', 'Porto', 'Braga', 'Almada'],
  Qatar: ['Doha', 'Al Rayyan', 'Umm Salal'],
  Romania: ['Bucharest', 'Cluj-Napoca', 'Timisoara', 'Iasi'],
  Russia: ['Moscow', 'St. Petersburg', 'Novosibirsk', 'Ekaterinburg', 'Sochi', 'Vladivostok'],
  Rwanda: ['Kigali', 'Butare', 'Gitarama'],
  'Saint Kitts and Nevis': ['Basseterre', 'Charlestown'],
  'Saint Lucia': ['Castries', 'Vieux Fort'],
  'Saint Vincent and the Grenadines': ['Kingstown', 'Bequia'],
  Samoa: ['Apia', 'Savaii'],
  'San Marino': ['San Marino City', 'Serravalle'],
  'Sao Tome and Principe': ['Sao Tome', 'Santo Antonio'],
  'Saudi Arabia': ['Riyadh', 'Jeddah', 'Dammam', 'Mecca', 'Medina', 'Abha'],
  Senegal: ['Dakar', 'Thies', 'Kaolack'],
  Serbia: ['Belgrade', 'Novi Sad', 'Nis', 'Zemun'],
  Seychelles: ['Victoria', 'Beau Vallon'],
  'Sierra Leone': ['Freetown', 'Bo', 'Kenema'],
  Singapore: ['Singapore'],
  Slovakia: ['Bratislava', 'Kosice', 'Presov'],
  Slovenia: ['Ljubljana', 'Maribor', 'Celje'],
  'Solomon Islands': ['Honiara', 'Auki'],
  Somalia: ['Mogadishu', 'Hargeisa', 'Kismayo'],
  'South Africa': ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Bloemfontein'],
  'South Korea': ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon'],
  'South Sudan': ['Juba', 'Wau', 'Malakal'],
  Spain: ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Bilbao'],
  'Sri Lanka': ['Colombo', 'Kandy', 'Galle', 'Jaffna'],
  Sudan: ['Khartoum', 'Omdurman', 'Port Sudan'],
  Suriname: ['Paramaribo', 'Lelydorp'],
  Eswatini: ['Mbabane', 'Manzini'],
  Sweden: ['Stockholm', 'Gothenburg', 'Malmo', 'Uppsala'],
  Switzerland: ['Zurich', 'Geneva', 'Basel', 'Bern', 'Lucerne'],
  Syria: ['Damascus', 'Aleppo', 'Homs', 'Latakia'],
  Taiwan: ['Taipei', 'Kaohsiung', 'Taichung', 'Tainan'],
  Tajikistan: ['Dushanbe', 'Khujand', 'Kulob'],
  Tanzania: ['Dar es Salaam', 'Dodoma', 'Mwanza', 'Arusha'],
  Thailand: ['Bangkok', 'Chiang Mai', 'Pattaya', 'Rayong', 'Udon Thani'],
  'Timor-Leste': ['Dili', 'Baucau'],
  Togo: ['Lome', 'Sokode', 'Kpalime'],
  Tonga: ['Nuku alofa', 'Neiafu'],
  'Trinidad and Tobago': ['Port of Spain', 'San Fernando', 'Arima'],
  Tunisia: ['Tunis', 'Sfax', 'Sousse', 'Kairouan'],
  Turkey: ['Istanbul', 'Ankara', 'Izmir', 'Antalya', 'Bursa'],
  Turkmenistan: ['Ashgabat', 'Turkmenbashi', 'Dasoguz'],
  Tuvalu: ['Funafuti', 'Nukufetau'],
  Uganda: ['Kampala', 'Gulu', 'Lira', 'Mbarara'],
  Ukraine: ['Kyiv', 'Kharkiv', 'Odesa', 'Dnipro', 'Donetsk'],
  'United Arab Emirates': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'],
  'United Kingdom': ['London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow', 'Edinburgh', 'Cardiff'],
  'United States': ['California', 'Texas', 'Florida', 'New York', 'Pennsylvania', 'Illinois', 'Ohio', 'Georgia', 'North Carolina', 'Michigan'],
  Uruguay: ['Montevideo', 'Salto', 'Paysandu'],
  Uzbekistan: ['Tashkent', 'Samarkand', 'Bukhara', 'Andijan'],
  Vanuatu: ['Port Vila', 'Luganville'],
  'Vatican City': ['Vatican City'],
  Venezuela: ['Caracas', 'Maracaibo', 'Valencia', 'Barquisimeto'],
  Vietnam: ['Hanoi', 'Ho Chi Minh City', 'Da Nang', 'Hai Phong', 'Can Tho'],
  'West Bank': ['Ramallah', 'Bethlehem', 'Hebron'],
  Yemen: ['Sana a', 'Aden', 'Taiz'],
  Zambia: ['Lusaka', 'Ndola', 'Kitwe'],
  Zimbabwe: ['Harare', 'Bulawayo', 'Chitungwiza'],
}

const COUNTRY_LIST = Object.keys(COUNTRY_STATE_OPTIONS)

export default function ProfilePage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  
  // Form states
  const [basicForm, setBasicForm] = useState<any>({})
  const [educationForm, setEducationForm] = useState<any>({})
  const [jobForm, setJobForm] = useState<any>({})
  const [familyForm, setFamilyForm] = useState<any>({})
  const [contactForm, setContactForm] = useState<any>({})
  const [privacyForm, setPrivacyForm] = useState<any>({})
  
  const [editingEducation, setEditingEducation] = useState<string | null>(null)
  const [editingJob, setEditingJob] = useState<string | null>(null)

  // Profile photo state
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [photoError, setPhotoError] = useState<string | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      const data = await response.json()
      
      if (data.profile) {
        setProfile(data.profile)
        setBasicForm({
          fullName: data.profile.fullName || '',
          batchYear: data.profile.batchYear || '',
          department: data.profile.department || '',
          course: data.profile.course || '',
          city: data.profile.city || '',
          state: data.profile.state || '',
          country: data.profile.country || '',
          currentlyWorking: data.profile.currentlyWorking || false,
          currentlyStudying: data.profile.currentlyStudying || false,
        })
        
        setFamilyForm({
          maritalStatus: data.profile.maritalStatus || '',
          spouseName: data.profile.spouseName || '',
          childrenCount: data.profile.childrenCount || 0,
        })
        
        setContactForm({
          phone: data.profile.contactDetails?.phone || '',
          whatsapp: data.profile.contactDetails?.whatsapp || '',
          email: data.profile.contactDetails?.email || '',
          linkedinUrl: data.profile.contactDetails?.linkedinUrl || '',
          instagramUrl: data.profile.contactDetails?.instagramUrl || '',
        })
        
        setPrivacyForm({
          familyDetailsVisible: data.profile.privacySettings?.familyDetailsVisible || false,
          educationVisible: data.profile.privacySettings?.educationVisible || false,
          jobHistoryVisible: data.profile.privacySettings?.jobHistoryVisible || false,
          currentJobVisible: data.profile.privacySettings?.currentJobVisible || true,
          contactDetailsVisible: data.profile.privacySettings?.contactDetailsVisible || true,
        })

        if (data.profile.profilePhotoUrl) {
          setPhotoPreview(data.profile.profilePhotoUrl)
        } else {
          setPhotoPreview(null)
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setPhotoError('Please upload a valid image file (JPEG, PNG, WebP).')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setPhotoError('Image must be less than 2MB.')
      return
    }

    setPhotoError(null)
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handlePhotoUpload = async (event: FormEvent) => {
    event.preventDefault()
    if (!photoFile) return

    setPhotoUploading(true)
    setPhotoError(null)

    try {
      const formData = new FormData()
      formData.append('file', photoFile)

      const response = await fetch('/api/profile/photo', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload profile photo')
      }

      setProfile((prev: any) =>
        prev
          ? {
              ...prev,
              profilePhotoUrl: data.profilePhotoUrl,
            }
          : prev,
      )
      setPhotoFile(null)
    } catch (error: any) {
      console.error('Failed to upload profile photo:', error)
      setPhotoError(error.message || 'Failed to upload profile photo')
    } finally {
      setPhotoUploading(false)
    }
  }

  const updateBasicInfo = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(basicForm),
      })
      if (response.ok) {
        fetchProfile()
        setActiveSection(null)
      }
    } catch (error) {
      console.error('Failed to update:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateFamilyDetails = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(familyForm),
      })
      if (response.ok) {
        fetchProfile()
        setActiveSection(null)
      }
    } catch (error) {
      console.error('Failed to update:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateContactDetails = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/profile/contact', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      })
      if (response.ok) {
        fetchProfile()
        setActiveSection(null)
      }
    } catch (error) {
      console.error('Failed to update:', error)
    } finally {
      setLoading(false)
    }
  }

  const updatePrivacySettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/profile/privacy', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(privacyForm),
      })
      if (response.ok) {
        fetchProfile()
        setActiveSection(null)
      }
    } catch (error) {
      console.error('Failed to update:', error)
    } finally {
      setLoading(false)
    }
  }

  const addEducation = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/profile/education', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(educationForm),
      })
      if (response.ok) {
        fetchProfile()
        setEducationForm({})
        setActiveSection(null)
      }
    } catch (error) {
      console.error('Failed to add education:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteEducation = async (id: string) => {
    if (!confirm('Delete this education record?')) return
    try {
      await fetch(`/api/profile/education/${id}`, { method: 'DELETE' })
      fetchProfile()
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  const addJob = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/profile/job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobForm),
      })
      if (response.ok) {
        fetchProfile()
        setJobForm({})
        setActiveSection(null)
      }
    } catch (error) {
      console.error('Failed to add job:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteJob = async (id: string) => {
    if (!confirm('Delete this job record?')) return
    try {
      await fetch(`/api/profile/job/${id}`, { method: 'DELETE' })
      fetchProfile()
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  if (loading && !profile) {
    return <div className="text-center py-12">Loading profile...</div>
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Profile not found
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your personal information</p>
      </div>

      {/* Profile Photo */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Profile Photo</CardTitle>
            <CardDescription>Upload a clear photo for your member profile</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePhotoUpload} className="flex flex-col sm:flex-row items-start gap-6">
            <div className="flex-shrink-0">
              {photoPreview ? (
                <Image
                  src={photoPreview}
                  alt={profile.fullName}
                  width={96}
                  height={96}
                  className="rounded-full w-24 h-24 object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold">
                  {profile.fullName.charAt(0)}
                </div>
              )}
            </div>
            <div className="space-y-3 w-full">
              <div className="space-y-1">
                <Label htmlFor="profilePhoto">Choose Image</Label>
                <Input
                  id="profilePhoto"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
                <p className="text-xs text-muted-foreground">
                  JPEG, PNG or WebP. Max size 2MB.
                </p>
              </div>
              {photoError && (
                <div className="text-xs text-red-600">
                  {photoError}
                </div>
              )}
              <Button type="submit" size="sm" disabled={photoUploading || !photoFile}>
                <Upload className="w-4 h-4 mr-2" />
                {photoUploading ? 'Uploading...' : 'Save Photo'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Your personal details and current status</CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setActiveSection(activeSection === 'basic' ? null : 'basic')}
          >
            {activeSection === 'basic' ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
          </Button>
        </CardHeader>
        <CardContent>
          {activeSection === 'basic' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={basicForm.fullName}
                    onChange={(e) => setBasicForm({ ...basicForm, fullName: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Batch Year</Label>
                  <Input
                    type="number"
                    value={basicForm.batchYear}
                    onChange={(e) => setBasicForm({ ...basicForm, batchYear: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Department</Label>
                  <Input
                    value={basicForm.department}
                    onChange={(e) => setBasicForm({ ...basicForm, department: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Course</Label>
                  <Input
                    value={basicForm.course}
                    onChange={(e) => setBasicForm({ ...basicForm, course: e.target.value })}
                  />
                </div>
                <div>
                  <Label>City</Label>
                  <Input
                    value={basicForm.city}
                    onChange={(e) => setBasicForm({ ...basicForm, city: e.target.value })}
                  />
                </div>
                <div>
                  <Label>State</Label>
                  <select
                    value={basicForm.state}
                    onChange={(e) => setBasicForm({ ...basicForm, state: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select state</option>
                    {(COUNTRY_STATE_OPTIONS[basicForm.country] || []).map((state: string) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Country</Label>
                  <select
                    value={basicForm.country}
                    onChange={(e) =>
                      setBasicForm({
                        ...basicForm,
                        country: e.target.value,
                        state: '',
                      })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select country</option>
                    {COUNTRY_LIST.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={basicForm.currentlyWorking}
                    onChange={(e) => setBasicForm({ ...basicForm, currentlyWorking: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Currently Working</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={basicForm.currentlyStudying}
                    onChange={(e) => setBasicForm({ ...basicForm, currentlyStudying: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Currently Studying</span>
                </label>
              </div>
              <Button onClick={updateBasicInfo} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Full Name</div>
                  <div className="font-medium">{profile.fullName}</div>
                </div>
                {profile.alumniId && (
                  <div>
                    <div className="text-sm text-muted-foreground">Alumni ID</div>
                    <div className="font-medium">{profile.alumniId}</div>
                  </div>
                )}
                {profile.batchYear && (
                  <div>
                    <div className="text-sm text-muted-foreground">Batch Year</div>
                    <div className="font-medium">{profile.batchYear}</div>
                  </div>
                )}
                {profile.department && (
                  <div>
                    <div className="text-sm text-muted-foreground">Department</div>
                    <div className="font-medium">{profile.department}</div>
                  </div>
                )}
                {profile.course && (
                  <div>
                    <div className="text-sm text-muted-foreground">Course</div>
                    <div className="font-medium">{profile.course}</div>
                  </div>
                )}
                {profile.city && (
                  <div>
                    <div className="text-sm text-muted-foreground">City</div>
                    <div className="font-medium">{profile.city}</div>
                  </div>
                )}
                {profile.state && (
                  <div>
                    <div className="text-sm text-muted-foreground">State</div>
                    <div className="font-medium">{profile.state}</div>
                  </div>
                )}
                {profile.country && (
                  <div>
                    <div className="text-sm text-muted-foreground">Country</div>
                    <div className="font-medium">{profile.country}</div>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {profile.currentlyWorking && <Badge variant="outline" className="bg-green-50">Currently Working</Badge>}
                {profile.currentlyStudying && <Badge variant="outline" className="bg-blue-50">Currently Studying</Badge>}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Education Records */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Education</CardTitle>
            <CardDescription>Your educational qualifications</CardDescription>
          </div>
          <Button
            size="sm"
            onClick={() => setActiveSection(activeSection === 'education' ? null : 'education')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Education
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeSection === 'education' && (
            <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>Institution</Label>
                  <Input
                    placeholder="e.g., MARKHINS College"
                    value={educationForm.institution || ''}
                    onChange={(e) => setEducationForm({ ...educationForm, institution: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Degree</Label>
                  <Input
                    placeholder="e.g., B.Tech"
                    value={educationForm.degree || ''}
                    onChange={(e) => setEducationForm({ ...educationForm, degree: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Field of Study</Label>
                  <Input
                    placeholder="e.g., Computer Science"
                    value={educationForm.fieldOfStudy || ''}
                    onChange={(e) => setEducationForm({ ...educationForm, fieldOfStudy: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Start Year</Label>
                  <Input
                    type="number"
                    placeholder="2016"
                    value={educationForm.startYear || ''}
                    onChange={(e) => setEducationForm({ ...educationForm, startYear: e.target.value })}
                  />
                </div>
                <div>
                  <Label>End Year</Label>
                  <Input
                    type="number"
                    placeholder="2020"
                    value={educationForm.endYear || ''}
                    onChange={(e) => setEducationForm({ ...educationForm, endYear: e.target.value })}
                    disabled={educationForm.currentlyStudying}
                  />
                </div>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={educationForm.currentlyStudying || false}
                  onChange={(e) => setEducationForm({ ...educationForm, currentlyStudying: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm">Currently Studying</span>
              </label>
              <div className="flex gap-2">
                <Button onClick={addEducation} size="sm" disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button onClick={() => { setActiveSection(null); setEducationForm({}); }} size="sm" variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          )}
          
          {profile.educationRecords?.length > 0 ? (
            profile.educationRecords.map((edu: any) => (
              <div key={edu.id} className="border rounded-lg p-4 flex justify-between items-start">
                <div>
                  <div className="font-semibold">{edu.degree} - {edu.fieldOfStudy}</div>
                  <div className="text-sm text-muted-foreground">{edu.institution}</div>
                  <div className="text-sm text-muted-foreground">
                    {edu.startYear} - {edu.currentlyStudying ? 'Present' : edu.endYear}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteEducation(edu.id)}
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground text-sm">
              No education records added yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job Experience */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Work Experience</CardTitle>
            <CardDescription>Your professional experience</CardDescription>
          </div>
          <Button
            size="sm"
            onClick={() => setActiveSection(activeSection === 'job' ? null : 'job')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Job
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeSection === 'job' && (
            <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>Company Name</Label>
                  <Input
                    placeholder="e.g., Tech Corp"
                    value={jobForm.companyName || ''}
                    onChange={(e) => setJobForm({ ...jobForm, companyName: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Job Title</Label>
                  <Input
                    placeholder="e.g., Software Engineer"
                    value={jobForm.jobTitle || ''}
                    onChange={(e) => setJobForm({ ...jobForm, jobTitle: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Industry</Label>
                  <Input
                    placeholder="e.g., Technology"
                    value={jobForm.industry || ''}
                    onChange={(e) => setJobForm({ ...jobForm, industry: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    placeholder="e.g., Bangalore, India"
                    value={jobForm.jobLocation || ''}
                    onChange={(e) => setJobForm({ ...jobForm, jobLocation: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={jobForm.startDate || ''}
                    onChange={(e) => setJobForm({ ...jobForm, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={jobForm.endDate || ''}
                    onChange={(e) => setJobForm({ ...jobForm, endDate: e.target.value })}
                    disabled={jobForm.currentlyWorking}
                  />
                </div>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={jobForm.currentlyWorking || false}
                  onChange={(e) => setJobForm({ ...jobForm, currentlyWorking: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm">Currently Working Here</span>
              </label>
              <div className="flex gap-2">
                <Button onClick={addJob} size="sm" disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button onClick={() => { setActiveSection(null); setJobForm({}); }} size="sm" variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          )}
          
          {profile.jobExperiences?.length > 0 ? (
            profile.jobExperiences.map((job: any) => (
              <div key={job.id} className="border rounded-lg p-4 flex justify-between items-start">
                <div>
                  <div className="font-semibold">{job.jobTitle}</div>
                  <div className="text-sm text-muted-foreground">{job.companyName}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(job.startDate).toLocaleDateString()} - {job.currentlyWorking ? 'Present' : new Date(job.endDate).toLocaleDateString()}
                  </div>
                  {job.jobLocation && <div className="text-xs text-muted-foreground">{job.jobLocation}</div>}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteJob(job.id)}
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground text-sm">
              No job records added yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Family Details */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Family Details</CardTitle>
            <CardDescription>Your family information</CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setActiveSection(activeSection === 'family' ? null : 'family')}
          >
            {activeSection === 'family' ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
          </Button>
        </CardHeader>
        <CardContent>
          {activeSection === 'family' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Marital Status</Label>
                  <select
                    value={familyForm.maritalStatus}
                    onChange={(e) => setFamilyForm({ ...familyForm, maritalStatus: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select</option>
                    <option value="SINGLE">Single</option>
                    <option value="MARRIED">Married</option>
                    <option value="DIVORCED">Divorced</option>
                    <option value="WIDOWED">Widowed</option>
                  </select>
                </div>
                <div>
                  <Label>Spouse Name</Label>
                  <Input
                    value={familyForm.spouseName}
                    onChange={(e) => setFamilyForm({ ...familyForm, spouseName: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Number of Children</Label>
                  <Input
                    type="number"
                    value={familyForm.childrenCount}
                    onChange={(e) => setFamilyForm({ ...familyForm, childrenCount: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={updateFamilyDetails} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {profile.maritalStatus && <div><span className="text-muted-foreground">Marital Status:</span> {profile.maritalStatus}</div>}
              {profile.spouseName && <div><span className="text-muted-foreground">Spouse:</span> {profile.spouseName}</div>}
              {profile.childrenCount > 0 && <div><span className="text-muted-foreground">Children:</span> {profile.childrenCount}</div>}
              {!profile.maritalStatus && <div className="text-muted-foreground text-sm">No family details added</div>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Details */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Contact Details</CardTitle>
            <CardDescription>Your contact information and social links</CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setActiveSection(activeSection === 'contact' ? null : 'contact')}
          >
            {activeSection === 'contact' ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
          </Button>
        </CardHeader>
        <CardContent>
          {activeSection === 'contact' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    placeholder="+91 1234567890"
                  />
                </div>
                <div>
                  <Label>WhatsApp</Label>
                  <Input
                    value={contactForm.whatsapp}
                    onChange={(e) => setContactForm({ ...contactForm, whatsapp: e.target.value })}
                    placeholder="+91 1234567890"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <Label>LinkedIn URL</Label>
                  <Input
                    value={contactForm.linkedinUrl}
                    onChange={(e) => setContactForm({ ...contactForm, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
                <div>
                  <Label>Instagram URL</Label>
                  <Input
                    value={contactForm.instagramUrl}
                    onChange={(e) => setContactForm({ ...contactForm, instagramUrl: e.target.value })}
                    placeholder="https://instagram.com/yourprofile"
                  />
                </div>
              </div>
              <Button onClick={updateContactDetails} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {profile.contactDetails?.phone && <div><span className="text-muted-foreground">Phone:</span> {profile.contactDetails.phone}</div>}
              {profile.contactDetails?.whatsapp && <div><span className="text-muted-foreground">WhatsApp:</span> {profile.contactDetails.whatsapp}</div>}
              {profile.contactDetails?.email && <div><span className="text-muted-foreground">Email:</span> {profile.contactDetails.email}</div>}
              {profile.contactDetails?.linkedinUrl && (
                <div>
                  <span className="text-muted-foreground">LinkedIn:</span>{' '}
                  <a href={profile.contactDetails.linkedinUrl} target="_blank" className="text-primary hover:underline">
                    View Profile
                  </a>
                </div>
              )}
              {profile.contactDetails?.instagramUrl && (
                <div>
                  <span className="text-muted-foreground">Instagram:</span>{' '}
                  <a href={profile.contactDetails.instagramUrl} target="_blank" className="text-primary hover:underline">
                    View Profile
                  </a>
                </div>
              )}
              {!profile.contactDetails?.phone && !profile.contactDetails?.email && (
                <div className="text-muted-foreground text-sm">No contact details added</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Privacy Settings</CardTitle>
            <CardDescription>Control who can see your information</CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setActiveSection(activeSection === 'privacy' ? null : 'privacy')}
          >
            {activeSection === 'privacy' ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
          </Button>
        </CardHeader>
        <CardContent>
          {activeSection === 'privacy' ? (
            <div className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Family Details</div>
                    <div className="text-sm text-muted-foreground">Marital status, spouse, children</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacyForm.familyDetailsVisible}
                    onChange={(e) => setPrivacyForm({ ...privacyForm, familyDetailsVisible: e.target.checked })}
                    className="w-4 h-4"
                  />
                </label>
                <label className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Education History</div>
                    <div className="text-sm text-muted-foreground">All education records</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacyForm.educationVisible}
                    onChange={(e) => setPrivacyForm({ ...privacyForm, educationVisible: e.target.checked })}
                    className="w-4 h-4"
                  />
                </label>
                <label className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Job History</div>
                    <div className="text-sm text-muted-foreground">All job experiences</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacyForm.jobHistoryVisible}
                    onChange={(e) => setPrivacyForm({ ...privacyForm, jobHistoryVisible: e.target.checked })}
                    className="w-4 h-4"
                  />
                </label>
                <label className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Current Job</div>
                    <div className="text-sm text-muted-foreground">Current position only</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacyForm.currentJobVisible}
                    onChange={(e) => setPrivacyForm({ ...privacyForm, currentJobVisible: e.target.checked })}
                    className="w-4 h-4"
                  />
                </label>
                <label className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Contact Details</div>
                    <div className="text-sm text-muted-foreground">Phone, email, social links</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacyForm.contactDetailsVisible}
                    onChange={(e) => setPrivacyForm({ ...privacyForm, contactDetailsVisible: e.target.checked })}
                    className="w-4 h-4"
                  />
                </label>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                <strong>Note:</strong> Non-alumni members can never see hidden information, regardless of privacy settings.
              </div>
              <Button onClick={updatePrivacySettings} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                Save Privacy Settings
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2">
                <span>Family Details</span>
                <Badge variant={profile.privacySettings?.familyDetailsVisible ? 'default' : 'secondary'}>
                  {profile.privacySettings?.familyDetailsVisible ? 'Visible' : 'Hidden'}
                </Badge>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Education History</span>
                <Badge variant={profile.privacySettings?.educationVisible ? 'default' : 'secondary'}>
                  {profile.privacySettings?.educationVisible ? 'Visible' : 'Hidden'}
                </Badge>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Job History</span>
                <Badge variant={profile.privacySettings?.jobHistoryVisible ? 'default' : 'secondary'}>
                  {profile.privacySettings?.jobHistoryVisible ? 'Visible' : 'Hidden'}
                </Badge>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Current Job</span>
                <Badge variant={profile.privacySettings?.currentJobVisible ? 'default' : 'secondary'}>
                  {profile.privacySettings?.currentJobVisible ? 'Visible' : 'Hidden'}
                </Badge>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Contact Details</span>
                <Badge variant={profile.privacySettings?.contactDetailsVisible ? 'default' : 'secondary'}>
                  {profile.privacySettings?.contactDetailsVisible ? 'Visible' : 'Hidden'}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div><span className="text-muted-foreground">Email:</span> {session?.user?.email}</div>
          <div><span className="text-muted-foreground">User Type:</span> {session?.user?.userType}</div>
          <div><span className="text-muted-foreground">Role:</span> {session?.user?.role}</div>
          <div><span className="text-muted-foreground">Loan Eligible:</span> {session?.user?.isLoanEligible ? 'Yes' : 'No'}</div>
        </CardContent>
      </Card>
    </div>
  )
}
