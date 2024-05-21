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
          labels: [], // Dates or time units
          datasets: [{
            label: 'Stock Price',
            data: [], // Stock prices
            borderColor: 'lightblue',
            backgroundColor: 'rgba(0, 0, 255, 1)',
            borderWidth: 2,
            pointRadius: 0,
            fill: false
          }]
        },
        options: {
          responsive: true,
          scales: {
            x: {
              display: true,
              title: {
                display: true,
                text: 'Date'
              }
            },
            y: {
              display: true,
              title: {
                display: true,
                text: 'Price'
              }
            }
          }
        }
      });

        // Register the chart canvas as a drop target
        chartCanvas.addEventListener('dragover', handleDragOver);
        chartCanvas.addEventListener('drop', handleDrop);

    }

    // Add an option leg to the editor
    function addOptionLeg() {
      const optionLeg = document.createElement('div');
      optionLeg.classList.add('option-leg');
      optionLeg.draggable = true;
      optionLeg.id = `option-leg-${Date.now()}`; // Assign a unique id
      optionLeg.innerHTML = `
        <select>
          <option value="call">CALL</option>
          <option value="put">PUT</option>
        </select>
        <input type="number" placeholder="Strike Price">
        <input type="number" placeholder="Cost">
        <input type="date" placeholder="Expiration Date">
        <label>
          <input type="checkbox"> BUY
        </label>
      `;
      optionLegContainer.appendChild(optionLeg);
    }

    // Update the chart based on the option legs
    function updateChart() {
      // Clear existing profit zones
      chart.data.datasets = chart.data.datasets.filter(dataset => dataset.label !== 'Profit Zone');

      // Calculate and render profit zones for each option leg
      optionLegs.forEach(optionLeg => {
        const profitZoneDataset = {
          label: 'Profit Zone',
          data: [], // Calculate profit zone data based on option leg parameters
          backgroundColor: 'rgba(0, 255, 0, 0.3)',
          borderColor: 'green',
          fill: true
        };
        chart.data.datasets.push(profitZoneDataset);
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
    
        // Get the option leg parameters
        const optionType = optionLeg.querySelector('select').value;
        const strikePrice = parseFloat(optionLeg.querySelector('input[placeholder="Strike Price"]').value);
        const cost = parseFloat(optionLeg.querySelector('input[placeholder="Cost"]').value);
        const expirationDate = new Date(optionLeg.querySelector('input[type="date"]').value);
        const isBuy = optionLeg.querySelector('input[type="checkbox"]').checked;
    
        // Create an option leg object
        const newOptionLeg = {
            type: optionType,
            strikePrice: strikePrice,
            cost: cost,
            expirationDate: expirationDate,
            isBuy: isBuy
        };
    
        // Add the option leg to the array
        optionLegs.push(newOptionLeg);
    
        // Update the chart
        updateChart();
    }

    // Event listeners
    addOptionLegButton.addEventListener('click', addOptionLeg);
    optionLegContainer.addEventListener('dragstart', handleDragStart);
    //optionLegContainer.addEventListener('dragover', handleDragOver);
    //optionLegContainer.addEventListener('drop', handleDrop);

    // Initialize the chart and add initial option legs
    initializeChart();
    addOptionLeg();

} catch (e) {
    console.log(e);
}