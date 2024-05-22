try {

    // JavaScript Code
    const chartCanvas = document.getElementById('stockChart');
    const optionLegContainer = document.getElementById('optionLegContainer');
    const addOptionLegButton = document.getElementById('addOptionLegButton');

    let chart;
    let optionLegs = [];

    // Initialize the chart
    function initializeChart() {
        const ctx = chartCanvas.getContext('2d');
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Stock Price',
                    data: [], // Stock price objects //
                    borderColor: 'lightblue',
                    backgroundColor: 'rgba(0, 0, 255, 1)',
                    xAxisID: 'x',
                    yAxisID: 'y',
                    fill: false
                }]
            },
            options: {
                responsive: true,
                scales: {
                    'x': {
                        type: 'linear',
                        display: true,
                        title: {
                            display: true,
                            text: 'Time Interval - Days'
                        }
                    },
                    'y': {
                        position: 'left',
                        type: 'linear',
                        display: true,
                        title: {
                            display: true,
                            text: 'Stock Price'
                        },
                        ticks: {
                            display: true, // Disable tick marks for the primary y-axis
                            callback: function(value, index, values) {
                                return value.toFixed(2); // Format the tick labels
                            }
                        },
                        grid: {
                            drawOnChartArea: true // Show the grid lines for the primary y-axis
                        }
                    },
                    'y-axis-right': {
                        position: 'right',
                        type: 'linear',
                        display: true,
                        title: {
                            display: true,
                            text: 'Stock Price'
                        },
                        ticks: {
                            display: false, // Disable tick marks for the primary y-axis
                            callback: function(value, index, values) {
                                return value.toFixed(2); // Format the tick labels
                            }
                        },
                        grid: {
                            drawOnChartArea: false // Show the grid lines for the primary y-axis
                        }
                    } // y-right
                }, // scales
                plugins: {
                    tooltip: {
                        // Enable custom tooltips
                        enabled: true,
                        position: 'nearest',
                        intersect: true,
                        bodyFontSize: 12, // Tooltip font size
                        callbacks: {
                            title: function(tooltips, data) {
                                // Assuming the first dataset is for amplitude and has complete frame and time_step data
                                const tt = tooltips[0];
                                const tmpTimeStep = tt.label;
                                return `Time Interval: ${tmpTimeStep}`;
                            },
                            label: function(tooltipItem, data) {
                                // tooltipItem is an object containing properties of the tooltip
                                // data is an object containing all data passed to the chart
                                let yLabel = tooltipItem.formattedValue;
                                const xLabel = tooltipItem.dataset.label;

                                if (xLabel.match(/^Profit/)) {
                                    yLabel = `Stock Price: ${yLabel}`;
                                } 
                                
                                return yLabel;
                            }
                        }
                    },
                },
            } // initializeChart
        }); // chart

        // Register the chart canvas as a drop target
        chartCanvas.addEventListener('dragover', handleDragOver);
        chartCanvas.addEventListener('drop', handleDrop);

    }

    // Add an option leg to the editor
    function addOptionLeg() {
        const optionLeg = document.createElement('div');

        optionLeg.classList.add('option-leg');
        optionLeg.draggable = true;
        optionLeg.id = `option-leg-${Date.now()}`; // Assign a unique id //
        optionLeg.innerHTML = `
          <select>
            <option value="call">CALL</option>
            <option value="put">PUT</option>
          </select>
          <input type="number" placeholder="Strike Price">
          <label>
            <input type="checkbox" checked> BUY
          </label>
          <input type="number" placeholder="Cost">
          <input type="number" placeholder="Days to Expiration">
          <button class="remove-btn">x</button>
        `;

        optionLegContainer.appendChild(optionLeg);
    }

    /**
     * @brief Linear Interpolation Algorithm
     * @param {*} t  step factor between interval [0,1]
     * @param {*} min 
     * @param {*} max 
     */
    function LERP(min, max, t) {
        if(t==0)
          return min;
        else if(t==1)
          return max;

        const u = min * (1 - t) + max * t;

        return u;
    }

    function populateDatasetBuffer(min, max, price){
        let lowvals = [];
        let vals = [];
        let highvals = [];

        for(let i = 0; i < 10; ++i) {
          const stepRatio = i/10;
          
          lowvals.push({ x: i, y: LERP(min, price, stepRatio) });
          vals.push({ x: i+10, y: price });
          highvals.push({ x: i+20, y: LERP(price, max, stepRatio) });
          
        }

        const rbuff = [...lowvals, ...vals, ...highvals];

        return rbuff;
    }

    function determineOptionType(optionLeg) {
        
        const val00 = optionLeg.strikePrice - optionLeg.strikePrice * .25;
        const val01 = optionLeg.strikePrice + optionLeg.strikePrice * .25;

        const price = optionLeg.strikePrice;

        const min = (optionLeg.type === "call")
          ? val00 /* Call */
          : val01 /* Put */;

        const max = (optionLeg.type === "call")
          ? val01 /* Call */
          : val00 /* Put */ ;

        return { min, max, price };
    }

    function determineOptionStrategy(optionLeg, buff){
        const strikePriceRange = determineOptionType(optionLeg);

        buff = optionLeg.isBuy
          ? populateDatasetBuffer(strikePriceRange.price, strikePriceRange.max, strikePriceRange.price)
          : populateDatasetBuffer(strikePriceRange.min, strikePriceRange.price, strikePriceRange.price) ;

        return buff;
    }

    function trendToExpiration(optionLeg, buff) {

        let i = 0;
        let I = buff.length;

        let lastVal = buff[I-1].y;
        const step = buff[I-1].y - buff[I-2].y;

        while((I <= optionLeg.expirationDate) && (lastVal > 0)) {
            let nextVal = lastVal + step;

            (nextVal > 0) && buff.push({ x: I, y: nextVal });

            lastVal = nextVal;
            ++I;
        }

        return buff;
    }

    function buildDataSet(optionLeg) {
        let buff = [];

        /**    
          // Create an option leg object
          const optionLeg = {
              type: optionType,
              strikePrice: strikePrice,
              cost: cost,
              expirationDate: expirationDate,
              isBuy: isBuy (bool)
          };
        */

        buff = determineOptionStrategy(optionLeg, buff);

        buff = trendToExpiration(optionLeg, buff);

        return buff;
        
    }

    // Update the chart based on the option legs
    function updateChart() {
        // Clear existing profit zones
        chart.data.datasets = []; //chart.data.datasets.filter(dataset => dataset.label !== 'Profit Zone');

        const put_FILL = 'start';
        const call_FILL = 'end';

        // Calculate and render profit zones for each option leg
        optionLegs.forEach(optionLeg => {

            const callOptionFlag = optionLeg.type === 'call';
            const putOptionFlag = optionLeg.type === 'put';
            const isBuyingFlag = optionLeg.isBuy == true;
            const isSellingFlag = optionLeg.isBuy == false;

            const priceIncreaseStrategyFlag = (
                   (callOptionFlag && isBuyingFlag) 
                || (putOptionFlag && isSellingFlag));

            // temporarily factor cost into profit
            if(priceIncreaseStrategyFlag) {
                optionLeg.strikePrice += optionLeg.cost;
            } else {                
                optionLeg.strikePrice -= optionLeg.cost;
            }

            const profitZoneDataset = {
                label: 'Profit Zone',
                data: buildDataSet(optionLeg), // Calculate profit zone data based on option leg parameters
                backgroundColor: 'rgba(0, 255, 0, 0.3)',
                borderColor: 'green',
                fill: priceIncreaseStrategyFlag ? call_FILL : put_FILL,
                yAxisID: 'y',
                xAxisID: 'x'
            };

            // is pass-by-reference, thus we need to reset
            if(priceIncreaseStrategyFlag) {
                optionLeg.strikePrice -= optionLeg.cost;
            } else {                
                optionLeg.strikePrice += optionLeg.cost;
            }

            chart.data.datasets.push(profitZoneDataset);
            
            return optionLeg;

        });

        chart.update();
    }

    // Handle drag and drop of option legs
    function handleDragStart(event) {
        event.dataTransfer.setData('text/plain', event.target.id);
    }

    // Handle drag over event on the chart canvas
    function handleDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    }    

    // Handle drop event on the chart canvas
    function handleDrop(event) {
        event.preventDefault();
        const optionLegId = event.dataTransfer.getData('text');
        const optionLeg = document.getElementById(optionLegId);  
        
        // Recover the unique identifier for the dropped option leg instance
        const uniqueId = optionLeg.id;

        // Get the option leg parameters
        const optionType = optionLeg.querySelector('select').value;
        const strikePrice = parseFloat(optionLeg.querySelector('input[placeholder="Strike Price"]').value);
        const cost = parseFloat(optionLeg.querySelector('input[placeholder="Cost"]').value);
        //const expirationDate = new Date(optionLeg.querySelector('input[type="date"]').value);
        const expirationDate = parseFloat(optionLeg.querySelector('input[placeholder="Days to Expiration"]').value);
        const isBuy = optionLeg.querySelector('input[type="checkbox"]').checked;

        // Create an option leg object
        const newOptionLeg = {
            id: uniqueId,
            type: optionType,
            strikePrice: strikePrice,
            cost: cost,
            expirationDate: expirationDate,
            isBuy: isBuy
        };

        optionLegs = optionLegs.filter(leg => leg.id != uniqueId);

        // Add the option leg to the array
        optionLegs.push(newOptionLeg);

        // Update the chart
        updateChart();
    }

    function handleRemoveButtonClick(event) {
        if (event.target.classList.contains('remove-btn')) {
            const optionLeg = event.target.closest('.option-leg');
            const optionLegId = optionLeg.id;
        
            // Remove the option leg from the DOM
            optionLeg.remove();
        
            // Remove the corresponding option leg data from the optionLegs array
            optionLegs = optionLegs.filter(leg => leg.id != optionLegId);
        
            // Update the chart
            updateChart();
        }
    }

    // Event listeners
    addOptionLegButton.addEventListener('click', addOptionLeg);
    optionLegContainer.addEventListener('dragstart', handleDragStart);
    optionLegContainer.addEventListener('click', handleRemoveButtonClick);

    // Initialize the chart and add initial option legs
    initializeChart();
    addOptionLeg();

} catch (e) {
    console.log(e);
}

/*

There are several formulas and models used to calculate the theoretical price of an option and estimate how its price decays over time. One of the most widely used models is the Black-Scholes-Merton (BSM) option pricing model.

The Black-Scholes-Merton formula for calculating the theoretical price of a European-style call option is as follows:

```
C = S * N(d1) - K * e^(-r * T) * N(d2)

where:
C = Call option price
S = Current stock price
K = Strike price of the option
r = Risk-free interest rate
T = Time to expiration (in years)
e = Mathematical constant (approximately 2.71828)
N(x) = Standard normal cumulative distribution function
d1 = (ln(S/K) + (r + σ^2/2) * T) / (σ * sqrt(T))
d2 = d1 - σ * sqrt(T)
σ = Implied volatility of the stock
```

The Black-Scholes-Merton formula for calculating the theoretical price of a European-style put option is:

```
P = K * e^(-r * T) * N(-d2) - S * N(-d1)

where:
P = Put option price
The other variables are the same as in the call option formula.
```

These formulas take into account several key factors that influence option prices, including the current stock price, strike price, time to expiration, risk-free interest rate, and implied volatility.

Regarding the way option prices decay over time, the concept of "time decay" or "theta decay" is important. The time value of an option decreases as the expiration date approaches, assuming all other factors remain constant. This decay accelerates as the option gets closer to expiration.

The Greek letter "theta" (θ) is used to measure the rate of change in an option's price with respect to the passage of time. Theta is typically expressed as the amount an option's price will decrease by per day, assuming all other variables remain constant.

The Black-Scholes-Merton model can be used to estimate theta by taking the partial derivative of the option price with respect to time. The formula for theta is complex and depends on various inputs, such as the current stock price, strike price, time to expiration, risk-free interest rate, and implied volatility.

It's important to note that while the Black-Scholes-Merton model is widely used, it has some limitations and assumptions, such as constant volatility and the absence of dividends. Other models, such as the binomial option pricing model and the Heston model, have been developed to address some of these limitations and incorporate additional factors.

In practice, option prices are influenced by various market factors, including supply and demand, market sentiment, and changes in the underlying stock price. Market participants use a combination of theoretical models and market observations to determine option prices.

*/
