import React ,{useState,useEffect,useCallback,useMemo }from 'react';
import styled from '@emotion/styled';
import { ReactComponent as AirFlowIcon } from './images/airFlow.svg';
import { ReactComponent as RainIcon } from './images/rain.svg';
import { ReactComponent as RedoIcon } from './images/refresh.svg';
import { ReactComponent as LoadingIcon } from './images/loading.svg';
import WeatherIcon from './WeatherIcon'
import sunriseAndSunsetData from './sunrise-sunset.json';

const theme = {
  light: {
    backgroundColor: '#ededed',
    foregroundColor: '#f9f9f9',
    boxShadow: '0 1px 3px 0 #999999',
    titleColor: '#212121',
    temperatureColor: '#757575',
    textColor: '#828282',
  },
  dark: {
    backgroundColor: '#1F2022',
    foregroundColor: '#121416',
    boxShadow:
      '0 1px 4px 0 rgba(12, 12, 13, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.15)',
    titleColor: '#f9f9fa',
    temperatureColor: '#dddddd',
    textColor: '#cccccc',
  },
};

const Container = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const WeatherCard = styled.div`
  position: relative;
  min-width: 360px;
  box-shadow: 0 1px 3px 0 #999999;
  background-color: #f9f9f9;
  box-sizing: border-box;
  padding: 30px 15px;
`;

const Location = styled.div`
  font-size: 28px;
  color: #212121;
  margin-bottom: 20px;
`;

const Description = styled.div`
  font-size: 16px;
  color: #828282;
  margin-bottom: 30px;
`;

const CurrentWeather = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Temperature = styled.div`
  color: #757575;
  font-size: 96px;
  font-weight: 300;
  display: flex;
`;

const Celsius = styled.div`
  font-weight: normal;
  font-size: 42px;
`;



const AirFlow = styled.div`
  display: flex;
  align-items: center;
  font-size: 16x;
  font-weight: 300;
  color: #828282;
  margin-bottom: 20px;

  svg {
    width: 25px;
    height: auto;
    margin-right: 30px;
  }
`;

const Rain = styled.div`
  display: flex;
  align-items: center;
  font-size: 16x;
  font-weight: 300;
  color: #828282;

  svg {
    width: 25px;
    height: auto;
    margin-right: 30px;
  }
`;

const Redo = styled.div`
  position: absolute;
  right: 15px;
  bottom: 15px;
  font-size: 12px;
  display: inline-flex;
  align-items: flex-end;
  color: #828282;
  svg{
    margin-left: 10px;
    width: 15px;
    height: 15px;
    cursor: pointer;
  }
`;


const getMoment = (locationName) => {
  const location = sunriseAndSunsetData.find(
    (data) => data.locationName === locationName
  );

  if (!location) return null;

  const now = new Date();

  const nowDate = Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(now)
    .replace(/\//g, '-');

  const locationDate =
    location.time && location.time.find((time) => time.dataTime === nowDate);

  const sunriseTimestamp = new Date(
    `${locationDate.dataTime} ${locationDate.sunrise}`
  ).getTime();
  const sunsetTimestamp = new Date(
    `${locationDate.dataTime} ${locationDate.sunset}`
  ).getTime();
  const nowTimeStamp = now.getTime();

  return sunriseTimestamp <= nowTimeStamp && nowTimeStamp <= sunsetTimestamp
    ? 'day'
    : 'night';
};

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


const WeatherApp = () => {
  console.log("--invoke--")
  const [weatherElement, setWeatherElement] = useState({
    observationTime: '2019-10-02 22:10:00',
    locationName: '臺北市',
    description: '多雲時晴',
    temperature: 0,
    windSpeed: 0,
    humid: 0,
    isLoading:true
  });

  const {
    observationTime,
    locationName,
    temperature,
    windSpeed,
    description,
    weatherCode,
    rainPossibility,
    comfortability,
    isLoading,
    humid,
  } = weatherElement;

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

  const moment = useMemo(() => getMoment(locationName), [
    locationName,
  ]);


  return (
    <Container theme={theme.dark}>
      <WeatherCard>
        <Location>{locationName}</Location>
        <Description>

          {console.log("render")}
          {description}</Description>
        <CurrentWeather>
          <Temperature>
            
            {Math.round(temperature)} <Celsius>°C</Celsius>
          </Temperature>
          <WeatherIcon 
           currentWeatherCode ={weatherCode}
           moment={ moment || 'day'}
          />
        </CurrentWeather>
        <AirFlow>
          <AirFlowIcon />
          {windSpeed} m/h
        </AirFlow>
        <Rain>
          {console.log(humid)}
          <RainIcon />
          {humid}
        </Rain>
        <Redo  onClick={()=>{
           fetchData()
          } 
          }>
        {new Intl.DateTimeFormat('zh-TW', {
            hour: 'numeric',
            minute: 'numeric',
          }).format(new Date(observationTime))}
          {isLoading ? <LoadingIcon /> : <RedoIcon />}
          </Redo >
      </WeatherCard>
    </Container>
  );
};

export default WeatherApp;
