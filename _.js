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
            borderColor: 'blue',
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
    }

    // Add an option leg to the editor
    function addOptionLeg() {
      const optionLeg = document.createElement('div');
      optionLeg.classList.add('option-leg');
      optionLeg.draggable = true;
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

    function handleDragOver(event) {
      event.preventDefault();
    }

    function handleDrop(event) {
      event.preventDefault();
      const optionLegId = event.dataTransfer.getData('text');
      const optionLeg = document.getElementById(optionLegId);
      optionLegContainer.appendChild(optionLeg);
      updateChart();
    }

    // Event listeners
    addOptionLegButton.addEventListener('click', addOptionLeg);
    optionLegContainer.addEventListener('dragstart', handleDragStart);
    optionLegContainer.addEventListener('dragover', handleDragOver);
    optionLegContainer.addEventListener('drop', handleDrop);

    // Initialize the chart and add initial option legs
    initializeChart();
    addOptionLeg();

} catch (e) {
    console.log(e);
}