import { useEffect, useState, useSyncExternalStore } from "react"
import CitySearchDropdown from "./components/Searchbar";



function Home() {
    const [cityName, setCityName] = useState('');
    const [location, setLocation] = useState({ lat: null, lon: null });
    const [country, setCountry] = useState('');
    const [weatherData, setWeatherData] = useState([])
    const [dailyForecast, setDailyForecast] = useState([]);
    const [hourlyForecast, setHourlyForecast] = useState([]);
    const [loading, setLoading] = useState(false);
    const [settingStatus, setSettingStatus] = useState(false);
    const [units , setUnits] = useState({fahrenheit:false,speed:true,prec:true});
    const [dropdown, setDropdown] = useState(false);
    const [days, setDays] = useState(2)
    const [dayIndex, setDayIndex] = useState((new Date).getDate())
    
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    function getIcon (code) {
      if ([0].includes(code)) return "icon-sunny.webp";
      if ([1].includes(code)) return "icon-partly-cloudy.webp";
      if ([2,3].includes(code)) return "icon-overcast.webp";
      if ([45, 48].includes(code)) return "icon-fog.webp"
      if ([51, 53, 55, 56, 57].includes(code)) return "icon-drizzle.webp"
      if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "icon-rain.webp"
      if ([71, 73, 75, 77, 85, 86].includes(code)) return "icon-snow.webp"
      if ([95, 96, 99].includes(code)) return "icon-storm.webp"       
    }; 
  

    const handleSearch = (searchInput) => {
        if (!searchInput) return

        setLoading(true)

        

        fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${searchInput}`)
        .then(res => res.json())
        .then(data =>{
            if (!data.results) {
                alert('city not found')
            }
            const cityData = data.results[0];
            const { latitude, longitude, name, country } = cityData;
            setLocation({lat:latitude , lon:longitude})
            setCityName(name);
            setCountry(country)
            
            
            fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,weather_code&current=weather_code,temperature_2m,precipitation,wind_speed_10m,relative_humidity_2m&past_days=7`)
            .then(res => res.json())
            .then(weatherData => {
                const now = (new Date()).getHours()
                const currentTime = new Date(weatherData.current.time);
                const temps = weatherData.hourly.temperature_2m;
                const currentTemp = weatherData.current.temperature_2m;
                const windSpeed = weatherData.current.wind_speed_10m;
                const humidity = weatherData.current.relative_humidity_2m;
                const precipitation = weatherData.current.precipitation;
                

                
                const feelsLike = (13.12 + 0.6215 * currentTemp - 11.37 * Math.pow(windSpeed, 0.16) + 0.3965 * currentTemp * Math.pow(windSpeed, 0.16)).toFixed(1)
                setWeatherData({
                    temperature: currentTemp.toFixed(1),
                    windspeed: windSpeed,
                    humidity,
                    feelsLike,
                    precipitation,
                    currentTime
                  });
                
                const daily = temps.slice(0, 7).map((temp, idx) => ({
                    day: new Date (weatherData.daily.time[idx]),
                    icon: getIcon(weatherData.daily.weather_code[idx]),
                    max: weatherData.daily.temperature_2m_max[idx],
                    min: weatherData.daily.temperature_2m_min[idx]
              }));
              setDailyForecast(daily);

              
              const hourly = temps.slice(0, 8).map((temp, idx) => ({
                  time: `${now + idx} PM`,
                  icon: getIcon(weatherData.hourly.weather_code[168+now+idx]),
                  temp : temps[168+now+idx]
                }));
                setHourlyForecast(hourly);
            });
        })    
        .finally(() => {
          setLoading(false)
        })
    }
    
   const fetchNewDay = (idx)=>{
      setDays(idx)
      const today = new Date();
      const todayIndex = today.getDay();
      let diff = idx - todayIndex;
      console.log(days)
      let targetDate = new Date(today);
      targetDate.setDate(today.getDate() + diff);
      const now = (new Date()).getHours()
      targetDate = targetDate.getDate() * 24 + now - (((new Date()).getDate() - 7)*24)
      console.log(targetDate)
      
      
      
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&hourly=temperature_2m,weather_code&past_days=7`)
        .then(res => res.json())
        .then(data => {
          const temps = data.hourly.temperature_2m;
          const hourly = temps.slice(0,8).map((temp,idx) => ({
            time: `${now+idx} PM`,
            icon: getIcon(data.hourly.weather_code[targetDate+idx]),
            temp: temps[targetDate+idx]
          }));
          setHourlyForecast(hourly);
        }) 
    }

    useEffect(()=>{
      handleSearch('rasht')
    },[])


    return (<>
<div className="w-full md:px-28 sm:px-5 px-2 md:pt-12 pt-6 pb-20 bg-neutral-900 inline-flex flex-col justify-start items-center md:gap-16 overflow-hidden">

  <div className="self-stretch inline-flex justify-center items-center">
    <div className="flex-1 flex justify-start items-center gap-2.5 overflow-hidden">
      <img src="./assets/images/logo.svg" className="w-40 sm:w-50 " alt="logo" />
    </div>
    <div className=" relative inline-block ">
    <div onClick={()=>{setSettingStatus(!settingStatus)}} className="relative px-4 py-3 bg-neutral-800 rounded-lg flex justify-center items-center gap-2.5">
      <img src="./assets/images/icon-units.svg" className="text-center justify-start text-neutral-50 text-base font-normal " />
      <div className="text-center justify-start text-neutral-50 text-base font-medium font-[url('DM_Sans')] cursor-default leading-tight">
        Units </div>
      <img src="./assets/images/icon-dropdown.svg" className="justify-start text-neutral-50 lg:text-lg md:text-md text-sm"/>
    </div>
      
        {settingStatus && 
          <div data-version="Metrics" className="z-[10] w-52 px-2 py-1.5 right-0 top-12 absolute bg-neutral-800 rounded-xl shadow-[0px_8px_16px_0px_rgba(2,1,44,0.32)] outline outline-1 outline-offset-[-1px] outline-neutral-600 inline-flex flex-col justify-start items-start gap-1">
          <div data-status="Default" className="w-48 px-2 py-2.5 rounded-lg inline-flex justify-start items-center gap-2.5">
            <div className="flex-1 justify-start text-neutral-50 text-base font-medium font-[url('DM_Sans')] leading-tight">Switch to Imperial</div>
          </div>
          <div className="self-stretch flex flex-col justify-start items-start gap-2">
            <div className="self-stretch px-2 pt-1.5 inline-flex justify-start items-center gap-2.5">
              <div className="justify-start text-neutral-300 text-sm font-medium font-[url('DM_Sans')] leading-none">Temperature</div>
            </div>
            <div className="self-stretch flex flex-col justify-start items-start gap-1">
              <div onClick={()=>{setUnits(prev=>({...prev,fahrenheit:false}))}} data-status="Active" className={`w-48 px-2 py-2.5 ${units.fahrenheit == false ? "bg-neutral-700 " : "bg-neutral-800"} cursor-pointer rounded-lg inline-flex justify-start items-center gap-2.5`}>
                <div className="flex-1 justify-start text-neutral-50 text-base font-medium font-[url('DM_Sans')] leading-tight">Celsius (°C)</div>
                {!units.fahrenheit && <img src="../assets/images/icon-checkmark.svg" className="justify-start text-white text-sm font-normal font-['Font_Awesome_5_Pro'] leading-none" />}
              </div>
              <div onClick={()=>{setUnits(prev=>({...prev,fahrenheit:true}))}} data-status="Default" className={`w-48 px-2 py-2.5 rounded-lg inline-flex justify-start items-center gap-2.5 cursor-pointer ${units.fahrenheit == true ? "bg-neutral-700 " : "bg-neutral-800"}`}>
                <div className="flex-1 justify-start text-neutral-50 text-base font-medium font-[url('DM_Sans')] leading-tight">Fahrenheit (°F)</div>
                {units.fahrenheit && <img src="../assets/images/icon-checkmark.svg" className="justify-start text-white text-sm font-normal font-['Font_Awesome_5_Pro'] leading-none" />}
              </div>
            </div>
          </div>
          <div className="self-stretch h-px bg-neutral-600" />
          <div className="self-stretch flex flex-col justify-start items-start gap-2">
            <div className="self-stretch px-2 pt-1.5 inline-flex justify-start items-center gap-2.5">
              <div className="justify-start text-neutral-300 text-sm font-medium font-[url('DM_Sans')] leading-none">Wind Speed</div>
            </div>
            <div className="self-stretch flex flex-col justify-start items-start gap-1">
              <div onClick={()=>{setUnits(prev=>({...prev,speed:true}))}} className={`w-48 px-2 py-2.5 ${units.speed == true ? "bg-neutral-700 " : "bg-neutral-800"} cursor-pointer rounded-lg inline-flex justify-start items-center gap-2.5`}>
                <div className="flex-1 justify-start text-neutral-50 text-base font-medium font-[url('DM_Sans')]  leading-tight">km/h</div>
                {units.speed && <img src="../assets/images/icon-checkmark.svg" className="justify-start text-white text-sm font-normal" />}
                </div>
              <div onClick={()=>{setUnits(prev=>({...prev,speed:false}))}} data-status="Default" className={`w-48 px-2 py-2.5 rounded-lg ${units.speed == false ? "bg-neutral-700 " : "bg-neutral-800"} cursor-pointer inline-flex justify-start items-center gap-2.5`}>
                <div className="flex-1 justify-start text-neutral-50 text-base font-medium font-[url('DM_Sans')] leading-tight">mph</div>
                {!units.speed && <img src="../assets/images/icon-checkmark.svg" className="justify-start text-white text-sm font-normal" />}

              </div>
            </div>
          </div>
          <div className="self-stretch h-px bg-neutral-600" />
          <div className="self-stretch flex flex-col justify-start items-start gap-2">
            <div className="self-stretch px-2 pt-1.5 inline-flex justify-start items-center gap-2.5">
              <div className="justify-start text-neutral-300 text-sm font-medium font-[url('DM_Sans')] leading-none">Precipitation</div>
            </div>
            <div className="self-stretch flex flex-col justify-start items-start gap-1">
              <div onClick={()=>{setUnits(prev=>({...prev,prec:true}))}} className={`${units.prec == true ? "bg-neutral-700 " : "bg-neutral-800"} w-48 px-2 py-2.5 bg-neutral-700 cursor-pointer rounded-lg inline-flex justify-start items-center gap-2.5`}>
                <div  className=" flex-1 justify-start text-neutral-50 text-base font-medium font-[url('DM_Sans')] leading-tight">Millimeters (mm)</div>
                {units.prec && <img src="../assets/images/icon-checkmark.svg" className="justify-start text-white text-sm font-normal font-['Font_Awesome_5_Pro'] leading-none" />}
                </div>
              <div onClick={()=>{setUnits(prev=>({...prev,prec:false}))}} className={`w-48 px-2 py-2.5 rounded-lg inline-flex cursor-pointer justify-start items-center ${units.prec == false ? "bg-neutral-700 " : "bg-neutral-800"} gap-2.5`}>
                <div className="flex-1 justify-start text-neutral-50 text-base font-medium font-[url('DM_Sans')] leading-tight">Inches (in)</div>
                {!units.prec && <img src="../assets/images/icon-checkmark.svg" className="justify-start text-white text-sm font-normal font-['Font_Awesome_5_Pro'] leading-none" />}
              </div>
            </div>
          </div>
        </div>
        }
    </div>
        </div>
  


  <div className="text-center justify-center w-auto text-neutral-50 text-5xl mx-40 md:mx-0 md:my-0 my-10 font-bold font-[url('Bricolage_Grotesque')] leading-[62.40px]">
    How’s the sky looking today?</div>
  <div className="self-stretch w-full flex flex-col justify-start items-center gap-12">
    <div className="w-full md:w-[800px] inline-flex justify-center items-start gap-4">
      <div data-status="Default" className=" w-full md:w-[625px] md:px-6 py-4 rounded-xl flex flex-col sm:flex-row justify-start items-center gap-4">
        <CitySearchDropdown onSelect={handleSearch} />
      </div>
    </div>
  </div>

  <div className="md:self-stretch md:inline-flex w-full md:flex-row justify-start items-start flex flex-col gap-8">
      <div className=" w-full inline-flex flex-col justify-start items-start gap-7">

      <div  className="self-stretch flex flex-col  justify-start items-start gap-8">
        {loading ? <div className="md:self-stretch h-72 px-6 py-20 relative bg-neutral-800 inline-flex justify-center items-center overflow-hidden outline-1 outline-neutral-600 ">
              <img src="./assets/images/icon-loading.svg" className="animate-spin" alt="..." />
              <div className="text-neutral-50 px-2">
                loading
              </div>
            </div> :
        <div className="self-stretch sm:flex-row flex-col bg-cover h-72 px-6 py-20 bg-no-repeat  relative bg-[url('../assets/images/bg-today-large.svg')] inline-flex justify-start items-center overflow-hidden rounded-[20px]">
          <div className="flex-1 h-16 inline-flex flex-col justify-start items-start gap-3">
            <div  className="text-center justify-start text-neutral-50 md:text-3xl text-xl font-bold font-[url('DM_Sans')] leading-loose">
              {cityName}, {country}</div>
            <div className="opacity-80 text-center justify-start text-neutral-50 text-lg font-medium font-[url('DM_Sans')] leading-snug">
              {weatherData.currentTime && weatherData.currentTime.toLocaleDateString()} {weatherData.currentTime && daysOfWeek[weatherData.currentTime.getDay()]}</div>
          </div>

          <div className="flex  justify-end items-center gap-5">
            <div className="w-25 h-25 relative">
              <img className="w-25 h-25 left-0 top-0 absolute" src="./assets/images/icon-sunny.webp" />
            </div>
            <div  className="text-center justify-start text-neutral-50 md:text-8xl text-6xl font-semibold font-[url('DM_Sans')] leading-[96px]">
              {units.fahrenheit ? (weatherData.temperature * 9/5 +32).toFixed(1) : weatherData.temperature}° </div>
          </div>
        </div>
      }
        <div className="self-stretch inline-flex justify-center items-center flex flex-wrap gap-6">
          <div className="sm:flex-1 sm:w-full w-[calc(50%-12px)] p-5 bg-neutral-800 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-600 inline-flex flex-col justify-start items-start gap-6">
            <div className="text-center justify-start text-neutral-200 text-lg font-medium font-[url('DM_Sans')] leading-snug">
              Feels Like</div>
            <div className="text-center justify-start text-neutral-50 text-3xl font-light font-[url('DM_Sans')] leading-loose">
              {loading ? <> - </> : units.fahrenheit ? (weatherData.feelsLike * 9/5 +32).toFixed(1) : weatherData.feelsLike}°</div>
          </div>
          <div className="sm:flex-1 sm:w-full w-[calc(50%-12px)] p-5 bg-neutral-800 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-600 inline-flex flex-col justify-start items-start gap-6">
            <div className="text-center justify-start text-neutral-200 text-lg font-medium font-[url('DM_Sans')] leading-snug">
              Humidity</div>
            <div className="text-center justify-start text-neutral-50 text-3xl font-light font-[url('DM_Sans')] leading-loose">
              {loading ? <> - </> : weatherData.humidity}%</div>
          </div>
          <div className="sm:flex-1 sm:w-full w-[calc(50%-12px)] p-5 bg-neutral-800 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-600 inline-flex flex-col justify-start items-start gap-6">
            <div className="text-center justify-start text-neutral-200 text-lg font-medium font-[url('DM_Sans')] leading-snug">
              Wind</div>
            <div className="text-center justify-start text-neutral-50 text-3xl  font-light font-[url('DM_Sans')] leading-loose">
              {loading ? <> - </> : units.speed ? <> {weatherData.windspeed} km/h </> : <> {(weatherData.windspeed * 1.6).toFixed(1)}  mph</> } </div>
          </div>
          <div className="sm:flex-1 sm:w-full w-[calc(50%-12px)] p-5 bg-neutral-800 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-600 inline-flex flex-col justify-start items-start gap-6">
            <div className="text-center justify-start text-neutral-200 text-lg font-medium font-[url('DM_Sans')] leading-snug">
              Precipitation</div>
            <div className="text-center justify-start text-neutral-50 text-3xl font-light font-[url('DM_Sans')] leading-loose">
              {loading ? <> - </> : units.prec ? <>{weatherData.precipitation} mm</> : <>{weatherData.precipitation *25.4} inch</>} </div>
          </div>
        </div>
      </div>


      <div className="self-stretch flex flex-col justify-start items-start gap-5">
        <div className="self-stretch justify-start text-neutral-50 text-xl font-semibold font-url('DM_Sans')] leading-normal">
          Daily forecast</div>
          <div className="self-stretch flex flex-row flex-wrap justify-start items-start gap-5">
        {dailyForecast.map((day, idx) => (
          <div key={idx} className="md:flex-1 w-[calc(33%-20px)] px-2 py-4 bg-neutral-800 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-600 inline-flex flex-col justify-start items-center gap-2 overflow-hidden">
            {loading ? <div className="px-2.5 py-10" > </div> : 
            <>
            <div className="text-center justify-start text-neutral-50 text-lg font-small font-['DM_Sans'] leading-snug">{daysOfWeek[day.day.getDay()]}</div>
            <div className="w-14 h-14 relative">
              <img className="w-14 h-14 left-0 top-0 absolute" src={`./assets/images/${day.icon}`} />
            </div>
            <div className="self-stretch inline-flex justify-between items-center">
              <div className="text-center text-sm justify-start text-neutral-50 text-base font-medium font-['DM_Sans'] leading-tight">{units.fahrenheit ?( day.max * 9/5 +32).toFixed(1) : day.max}°</div>
              <div className="text-center text-sm justify-start text-neutral-50 text-base font-small font-['DM_Sans'] leading-tight">{units.fahrenheit ? (day.min * 9/5 +32).toFixed(1) : day.min}°</div>
            </div>
            </>
            }
          </div>
        ))}
      </div>
    </div>
    </div>

    

    
    <div className="md:w-96 w-full p-6 relative bg-neutral-800 rounded-[20px] inline-flex flex-col justify-start items-start gap-4 overflow-hidden">
      <div className=" w-full inline-flex justify-between items-center">
        <div className="justify-start text-neutral-50 text-xl font-semibold font-[url('DM_Sans')] leading-normal">
          Hourly forecast</div>
        <div onClick={()=>{setDropdown(!dropdown)}} className="relative px-4 py-2 bg-neutral-600 cursor-pointer rounded-lg flex justify-center items-center gap-3">
          <div className="text-center justify-start text-neutral-50 text-base font-medium font-[url('DM_Sans')]">
            {daysOfWeek[days]}</div>
          <img src="./assets/images/icon-dropdown.svg" className="justify-start text-neutral-50 text-lg font-normal" />
        {dropdown &&
        <div className="w-20 p-2 right-0 top-12 absolute bg-neutral-800 rounded-xl z-[1] shadow-[0px_8px_16px_0px_rgba(2,1,44,0.32)] outline outline-1 outline-offset-[-1px] outline-neutral-600 inline-flex flex-col justify-start items-start gap-1">
          {daysOfWeek.map((day,idx)=>(
            <div key={idx} onClick={()=>{fetchNewDay(idx)}} className={`w-16 ${days == idx ? "bg-neutral-700" : "bg-neutral-800"} px-2 py-2.5 rounded-lg inline-flex justify-start items-center gap-2.5`}>
              <div className="flex-1 flex justify-center items-center text-neutral-50 text-base font-medium font-['DM_Sans'] leading-tight">{day}</div>
          </div>
          ))
          }
        </div>
        }
        </div>
      </div>
      {hourlyForecast.map((hour)=>(
        <div key={hour.time} className="self-stretch pl-3 pr-4 py-2.5 bg-neutral-700 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-600 inline-flex justify-start items-center gap-2 overflow-hidden">
        <div className="w-10 h-10 relative">
          <img className="w-10 h-10 left-0 top-0 absolute" src={`./assets/images/${hour.icon}`} />
        </div>
        <div className="flex-1 justify-start text-neutral-50 text-xl font-medium font-[url('DM_Sans')] leading-normal">
          {hour.time}</div>
        <div className="flex justify-start items-start gap-3">
          <div className="text-center justify-start text-neutral-50 text-base font-medium font-[url('DM_Sans')] leading-tight">
            {units.fahrenheit ? (hour.temp * 9/5 +32).toFixed(1) : hour.temp}°</div>
        </div>
      </div>
      ))}
    </div>
  </div>
</div>


    </>)
}

export default Home