// Main Processes for Weather Dashboard Application
// 1. Retrieve user inputs and convert them to variables
// 2. Use those variables to run an ajax call to the OpenWeather API.
// 3. Break down the OpenWeather object into usable fields. (May need to create a second ajax call to access the UV index data.)
// 4. Dynamically generate HTML content to provide the specified information.
//==================================================================================

// This is the API key. The imperial unit indicates that the temperature is delivered in Fahrenheit, so that no additional conversion needs to be done.
var APIKey = "&units=imperial&appid=e7111b1f6589775ae781984a6af9beb7";

// This is the base URL for the API call for the weather application.
var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=";

// This is the array of the cities that have been searched.
var citiesArray = JSON.parse(localStorage.getItem("cities")) || [];

// The variable for time through moment.js that establishes the current day, time, and time zone.
var m = moment();

// The fiveDayForecast function (which provides a forecast based on the search term) and the citySearch function (which empties the page of previously searched cities) are ready to executed upon loading the page.
$(document).ready(function() {
	var city = citiesArray[citiesArray.length - 1];
	fiveDayForecast(city);
	citySearch(city);
});

// This function starts by clearing out the five-day forecast (and all details) from a previous search on the page, so that the user finds no information from the previous search and can start anew.
function citySearch(city) {
	$(".city").empty();
	$(".temperature").empty();
	$(".humidity").empty();
	$(".wind").empty();
	$(".uvIndex").empty();

	// Created a variable that combines the base URL, the city name that is being searched, and the API key to create the whole URL for the ajax call.
	var citySearch = queryURL + city + APIKey;

	// The ajax call is placed within the function to call to the Open Weather Map website via a GET method for the weather data.
	$.ajax({
		url: citySearch,
		method: "GET"
	// This function retrieves the appropriate data from the ajax call, such as the name of the city, the date (using moment.js), the icon image, temperature, humidity, wind speed, and longitude and latitude coordinates for the UV index.
	}).then(function(weatherData) {
		var cityInfo = weatherData.name;
		var dateInfo = weatherData.dt;
		var currentDate = moment.unix(dateInfo).format("L");
		// In order to display the weather icons in the dashboard, various bits of information regarding the icons for each day needed to be pulled from the object array.
		var iconURL = "https://openweathermap.org/img/wn/";
		var iconString = "@2x.png";
		var iconWeather = weatherData.weather[0].icon;
		var iconUrl = iconURL + iconWeather + iconString;
		var iconImage = $("<img>");
		iconImage.attr("src", iconUrl);
		// The icon image and the information regarding the city searched is being rendered onto the HTML. 
		$(".city").append(cityInfo + " ");
		$(".city").append(currentDate + " ");
		$(".city").append(iconImage);

		// The temperature for the city is being rendered onto the HTML.
		var temperature = weatherData.main.temp;
		var fahrenheitTemperature = temperature.toFixed(0)
		$(".temperature").append("Temperature: " + fahrenheitTemperature + " °F");

		// The temperature for the ciy is being pulled from the object array and rendered onto the HTML.
		var humidityInfo = weatherData.main.humidity;
		$(".humidity").append("Humidity: " + humidityInfo + "%");

		// The wind speed for the city is being pulled from the object array and rendered onto the HTML.
		var windSpeed = weatherData.wind.speed;
		$(".wind").append("Wind Speed: " + windSpeed + " MPH");

		// The longitude and latitude coordinates are being pulled from the object array.
		var longitude = weatherData.coord.lon;
		var latitude = weatherData.coord.lat;

		// The longitude and latitude coordinates are being passed through the uvIndex function.
		uvIndex(longitude, latitude);
	});
}

function uvIndex(longitude, latitude) {
	// Created variables for the base URL for the UV index and added in the longitude and latitude coordinates to create the whole URL for the ajax call.
	var uvIndexURL = "https://api.openweathermap.org/data/2.5/uvi?appid=e7111b1f6589775ae781984a6af9beb7&lat=";
	var uvIndexString = "&lon=";
	var indexSearch = uvIndexURL + latitude + uvIndexString + longitude;
	// Another ajax call is placed within a function to call to the Open Weather Map website via a GET method for information regarding the UV index. The second ajax call is needed as the first ajax call only retrieves the coordinates of the city and the second ajax call pulls the data needed for the value of the UV index.
	$.ajax({
		url: indexSearch,
		method: "GET"
	}).then(function(weatherData) {
		var uvFinal = weatherData.value;

		// The UV index for the city is being rendered onto the HTML.
		$(".uvIndex").append("UV Index: ");
		// The button for the UV index is created and rendered onto the HTML.
		var uvBtn = $("<button>").text(uvFinal);
		$(".uvIndex").append(uvBtn);

		// The UV index needs to indicate whether the conditions are favorable, moderate, or severe. A UV index of 0 to 2 indicates favorable conditions. A UV index of 3 to 5 indicates moderate conditions. A UV index that is 6 or higher is considered high risk.
		if (uvFinal < 3) {
			// The media graphic color would be displayed as green.
			uvBtn.attr("style", "background-color:green");
		} else if (uvFinal < 6) {
			// The media graphic color would be displayed as yellow.
			uvBtn.attr("style", "background-color:yellow");
		} else if (uvFinal < 12) {
			// The media graphic color would be displayed as red.
			uvBtn.attr("style", "background-color:red");
		}
	})
};

function previouslySearchedCityButtons() {
	// This part of the function clears out the buttons from a previous search on the page.
	$(".list-group").empty();

	// The for loop goes through the array and turns each previously searched city into a button, so that the user can click on it in order to once again activate the weather data for that city.
	for (var i = 0; i < citiesArray.length; i++) {
		// Coded to push list items onto the HTML to provide the user with a list of previously searched cities.
		var cityButton = $("<li>");
		cityButton.addClass("cityName");
		cityButton.addClass("list-group-item");
		cityButton.attr("data-name", citiesArray[i]);
		cityButton.text(citiesArray[i]);
		$(".list-group").append(cityButton);
	}

	$(".cityName").on("click", function(event) {
		event.preventDefault();

		var city = $(this).data("name");

		fiveDayForecast(city);
		citySearch(city);
	});
}

function fiveDayForecast(city) {
	var fiveFront = "https://api.openweathermap.org/data/2.5/forecast?q=";
	var fiveURL = fiveFront + city + APIKey;

	$(".card-text").empty();
	$(".card-title").empty();

	$.ajax({
		url: fiveURL,
		method: "GET"
	}).then(function(weatherData) {
		// Using moment.js, the date for the next five days are rendered to be displayed.
		var dayOne = moment
			.unix(weatherData.list[1].dt)
			.utc()
			.format("L");
		$(".dayOne").append(dayOne);
		
		var dayTwo = moment
			.unix(weatherData.list[9].dt)
			.utc()
			.format("L");
		$(".dayTwo").append(dayTwo);
		
		var dayThree = moment
			.unix(weatherData.list[17].dt)
			.utc()
			.format("L");
		$(".dayThree").append(dayThree);
		
		var dayFour = moment
			.unix(weatherData.list[25].dt)
			.utc()
			.format("L");
		$(".dayFour").append(dayFour);
		
		var dayFive = moment
			.unix(weatherData.list[33].dt)
			.utc()
			.format("L");
		$(".dayFive").append(dayFive);

		// The weather icon for each individual day is pulled from the object array to then be appended onto the page.
		var dayOneIcon = $("<img>");
		var imageSourceOne = "https://openweathermap.org/img/wn/" + weatherData.list[4].weather[0].icon + "@2x.png";
		dayOneIcon.attr("src", imageSourceOne);
		$(".dayOneIcon").append(dayOneIcon);

		var dayTwoIcon = $("<img>");
		var imageSourceTwo = "https://openweathermap.org/img/wn/" + weatherData.list[12].weather[0].icon + "@2x.png";
		dayTwoIcon.attr("src", imageSourceTwo);
		$(".dayTwoIcon").append(dayTwoIcon);

		var dayThreeIcon = $("<img>");
		var imageSourceThree = "https://openweathermap.org/img/wn/" + weatherData.list[20].weather[0].icon + "@2x.png";
		dayThreeIcon.attr("src", imageSourceThree);
		$(".dayThreeIcon").append(dayThreeIcon);

		var dayFourIcon = $("<img>");
		var imageSourceFour = "https://openweathermap.org/img/wn/" + weatherData.list[28].weather[0].icon + "@2x.png";
		dayFourIcon.attr("src", imageSourceFour);
		$(".dayFourIcon").append(dayFourIcon);

		var dayFiveIcon = $("<img>");
		var imageSourceFive = "https://openweathermap.org/img/wn/" + weatherData.list[36].weather[0].icon + "@2x.png";
		dayFiveIcon.attr("src", imageSourceFive);
		$(".dayFiveIcon").append(dayFiveIcon);

		// The temperature for each individual day is pulled from the object array to then be appended onto the page.
		$(".dayOneTemperature").append("Temperature: ");
		$(".dayOneTemperature").append(
			tempAvg(
				weatherData.list[2].main.temp,
				weatherData.list[4].main.temp,
				weatherData.list[6].main.temp
			)
		);
		$(".dayOneTemperature").append(" °F");

		$(".dayTwoTemperature").append("Temperature: ");
		$(".dayTwoTemperature").append(
			tempAvg(
				weatherData.list[10].main.temp,
				weatherData.list[12].main.temp,
				weatherData.list[14].main.temp
			)
		);
		$(".dayTwoTemperature").append(" °F");

		$(".dayThreeTemperature").append("Temperature: ");
		$(".dayThreeTemperature").append(
			tempAvg(
				weatherData.list[18].main.temp,
				weatherData.list[20].main.temp,
				weatherData.list[22].main.temp
			)
		);
		$(".dayThreeTemperature").append(" °F");

		$(".dayFourTemperature").append("Temperature: ");
		$(".dayFourTemperature").append(
			tempAvg(
				weatherData.list[26].main.temp,
				weatherData.list[28].main.temp,
				weatherData.list[30].main.temp
			)
		);
		$(".dayFourTemperature").append(" °F");

		$(".dayFiveTemperature").append("Temperature: ");
		$(".dayFiveTemperature").append(
			tempAvg(
				weatherData.list[34].main.temp,
				weatherData.list[36].main.temp,
				weatherData.list[38].main.temp
			)
		);
		$(".dayFiveTemperature").append(" °F");

		// The humidity for each individual day is pulled from the object array to then be appended onto the page.
		$(".dayOneHumidity").append("Humidity: ");
		$(".dayOneHumidity").append(
			humidityAvg(
				weatherData.list[2].main.humidity,
				weatherData.list[4].main.humidity,
				weatherData.list[6].main.humidity
			)
		);
		$(".dayOneHumidity").append("%");

		$(".dayTwoHumidity").append("Humidity: ");
		$(".dayTwoHumidity").append(
			humidityAvg(
				weatherData.list[10].main.humidity,
				weatherData.list[12].main.humidity,
				weatherData.list[14].main.humidity
			)
		);
		$(".dayTwoHumidity").append("%");

		$(".dayThreeHumidity").append("Humidity: ");
		$(".dayThreeHumidity").append(
			humidityAvg(
				weatherData.list[18].main.humidity,
				weatherData.list[20].main.humidity,
				weatherData.list[22].main.humidity
			)
		);
		$(".dayThreeHumidity").append("%");

		$(".dayFourHumidity").append("Humidity: ");
		$(".dayFourHumidity").append(
			humidityAvg(
				weatherData.list[26].main.humidity,
				weatherData.list[28].main.humidity,
				weatherData.list[30].main.humidity
			)
		);
		$(".dayFourHumidity").append("%");

		$(".dayFiveHumidity").append("Humidity: ");
		$(".dayFiveHumidity").append(
			humidityAvg(
				weatherData.list[34].main.humidity,
				weatherData.list[36].main.humidity,
				weatherData.list[38].main.humidity
			)
		);
		$(".dayFiveHumidity").append("%");
	});
}

// The average temperature is calculated by taking temperatures from three instances of time and dividing it by three. 
function tempAvg(x, y, z) {
	var avgThree = (x + y + z) / 3.0;
	return avgThree.toFixed(0);;
}

function humidityAvg(x, y, z) {
	var avgHum = (x + y + z) / 3.0;
	return avgHum.toFixed(0);
}

// The function that calls three functions to get the appropriate weather data information once the search button is clicked. 
$("#add-city").on("click", function(event) {
	event.preventDefault();

	// The user inputs the city name that they are searching for into the input box with the #city-input ID.
	var city = $("#city-input").val().trim();

	var containsCity = false;

	if (citiesArray != null) {
		$(citiesArray).each(function(x) {
			if (citiesArray[x] === city) {
				containsCity = true;
			}
		});
	}

	if (containsCity === false) {
		citiesArray.push(city);
	}

	// Local storage is used to store data (previously searched cities) across browser sessions.
	localStorage.setItem("cities", JSON.stringify(citiesArray));

	// This called function displays the forecast for the upcoming five days.
	fiveDayForecast(city);

	// This called function places an ajax call to the Open Weather Map API to retrieve weather data for the city that the user searches.
	citySearch(city);

	// This called function renders the buttons (onto the page) of the previously searched cities.
	previouslySearchedCityButtons();
});
