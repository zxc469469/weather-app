import { useState, useEffect, useCallback } from 'react';


const fetchWeatherForecast = ()=>{
    //回傳promise
    return fetch('https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWB-4F63EAE5-2770-418A-845C-095E90FC1737&locationName=臺北市')
    .then((response) => response.json())
    .then((data) => {
      const locationData = data.records.location[0];
      const weatherElements = locationData.weatherElement.reduce(
        (neededElements, item) => {
          if (['Wx', 'PoP', 'CI'].includes(item.elementName)) {
            neededElements[item.elementName] = item.time[0].parameter;
          }
          return neededElements;
        },
        {}
      );
      return{
        description: weatherElements.Wx.parameterName,
        weatherCode: weatherElements.Wx.parameterValue,
        rainPossibility: weatherElements.PoP.parameterName,
        comfortability: weatherElements.CI.parameterName,
      };
    });
  }
  
  const fetchCurrentWeather = () =>{
    return fetch(
      'https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=CWB-4F63EAE5-2770-418A-845C-095E90FC1737&locationName=臺北'
    )
      .then((response) => response.json())
      .then((data) => {
  
        const locationData = data.records.location[0];
        console.log(locationData)
  
        const weatherElements = locationData.weatherElement.reduce(
        (neededElements, item) => {
          if (['WDSD', 'TEMP', 'HUMD'].includes(item.elementName)) {
            neededElements[item.elementName] = item.elementValue;
          }
          return neededElements;
        },
        {})
        return{
          observationTime: locationData.time.obsTime,
          locationName: locationData.locationName,
          temperature: weatherElements.TEMP,
          windSpeed: weatherElements.WDSD,
          humid: weatherElements.HUMD,
        };
      
      });
  }
  

const useWeatherApi = ()=>{
    const [weatherElement, setWeatherElement] = useState({
        observationTime: '2019-10-02 22:10:00',
        locationName: '臺北市',
        description: '多雲時晴',
        temperature: 0,
        windSpeed: 0,
        humid: 0,
        isLoading:true
      });
    
  const fetchData = useCallback(() => {
    const fetchingData = async () => {
      const [currentWeather, weatherForecast] = await Promise.all([
        fetchCurrentWeather(),
        fetchWeatherForecast(),
      ]);

      setWeatherElement({
        ...currentWeather,
        ...weatherForecast,
        isLoading:false
      });
    };
    
    setWeatherElement((prevState)=>({ ...prevState,isLoading:true}))
    fetchingData();
  }, []);

  useEffect(()=>{
    console.log('execute function in useEffect');
    fetchData();
  },[fetchData])
  
  return [weatherElement, fetchData];
}

export default useWeatherApi;