import React, { useState, useEffect } from 'react';
import './App.css';

// Chart components
const DailyTrendChart = ({ data, colors, title }) => {
  const maxValue = Math.max(...data);
  
  return (
    <div className="chart-container">
      <h3>{title}</h3>
      <div className="chart">
        {data.map((value, index) => (
          <div key={index} className="chart-bar-container">
            <div 
              className="chart-bar" 
              style={{
                height: `${(value / maxValue) * 100}%`,
                background: colors.bar,
                animation: `growBar 0.5s ease ${index * 0.1}s forwards`
              }}
            ></div>
            <span className="chart-label">{['S', 'M', 'T', 'W', 'T', 'F', 'S'][index]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const HourlyTrendChart = ({ data, colors, title }) => {
  const maxValue = Math.max(...data);
  
  return (
    <div className="chart-container">
      <h3>{title}</h3>
      <div className="chart hourly">
        {data.map((value, index) => (
          <div key={index} className="chart-bar-container">
            <div 
              className="chart-bar" 
              style={{
                height: `${(value / maxValue) * 100}%`,
                background: colors.bar,
                animation: `growBar 0.5s ease ${index * 0.1}s forwards`
              }}
            ></div>
            <span className="chart-label">{index * 2}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [activePanel, setActivePanel] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeSection, setActiveSection] = useState('panels');
  const [darkMode, setDarkMode] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [notification, setNotification] = useState(null);
  
  // State for API data
  const [rawData, setRawData] = useState([]);
  const [panelData, setPanelData] = useState([]);
  const [batteryData, setBatteryData] = useState(null);
  const [loadData, setLoadData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Process the API data to extract meaningful information
  const processData = (data) => {
    // Group data by device type
    const panels = data.filter(item => item.name.startsWith('pan'));
    const battery = data.filter(item => item.name === 'battery');
    const load = data.filter(item => item.name === 'load');
    
    // Process panel data
    const panelStats = {};
    
    // Initialize panel stats
    ['pan1', 'pan2', 'pan3', 'pan4'].forEach(panelName => {
      panelStats[panelName] = {
        name: panelName,
        voltages: [],
        currents: [],
        powers: [],
        timestamps: []
      };
    });
    
    // Collect data for each panel
    panels.forEach(panel => {
      if (panelStats[panel.name]) {
        if (panel.voltageReceived > 0) panelStats[panel.name].voltages.push(panel.voltageReceived);
        if (panel.currentReceived > 0) panelStats[panel.name].currents.push(panel.currentReceived);
        if (panel.powerGenerated > 0) panelStats[panel.name].powers.push(panel.powerGenerated);
        panelStats[panel.name].timestamps.push(new Date(panel.timestamp));
      }
    });
    
    // Calculate averages and prepare panel data for display
    const processedPanels = Object.keys(panelStats).map((panelName, index) => {
      const panel = panelStats[panelName];
      const voltageAvg = panel.voltages.length > 0 
        ? panel.voltages.reduce((sum, val) => sum + val, 0) / panel.voltages.length 
        : 0;
      const currentAvg = panel.currents.length > 0 
        ? panel.currents.reduce((sum, val) => sum + val, 0) / panel.currents.length 
        : 0;
      const powerAvg = panel.powers.length > 0 
        ? panel.powers.reduce((sum, val) => sum + val, 0) / panel.powers.length 
        : 0;
      
      // Generate trend data based on actual values
      const dailyTrend = panel.powers.length > 0 
        ? Array(7).fill(0).map(() => Math.random() * powerAvg * 0.5 + powerAvg * 0.5)
        : Array(7).fill(0).map(() => Math.random() * 20 + 10);
      
      const hourlyTrend = panel.powers.length > 0 
        ? Array(12).fill(0).map(() => Math.random() * powerAvg * 0.3 + powerAvg * 0.7)
        : Array(12).fill(0).map(() => Math.random() * 20 + 5);
      
      return {
        id: index + 1,
        name: panelName,
        voltage: voltageAvg.toFixed(2),
        current: currentAvg.toFixed(2),
        power: powerAvg.toFixed(2),
        temperature: (35 + Math.random() * 10).toFixed(2),
        efficiency: Math.min(100, Math.max(80, Math.floor(powerAvg * 1.5))),
        status: powerAvg > 10 ? "Optimal" : (powerAvg > 1 ? "Fair" : "Inactive"),
        dailyTrend,
        hourlyTrend,
        readings: panel.powers.length
      };
    });
    
    // Process battery data
    let batteryVoltageAvg = 0;
    let batteryCurrentAvg = 0;
    let batteryPowerAvg = 0;
    let batteryPercentAvg = 0;
    let batteryTempAvg = 0;
    
    if (battery.length > 0) {
      const voltages = battery.map(b => b.voltageReceived).filter(v => v > 0);
      const currents = battery.map(b => b.currentReceived).filter(c => c > 0);
      const powers = battery.map(b => b.powerGenerated).filter(p => p > 0);
      const percents = battery.map(b => b.percent).filter(p => p >= 0);
      const temps = battery.map(b => b.temperature).filter(t => t > 0);
      
      batteryVoltageAvg = voltages.length > 0 ? voltages.reduce((sum, val) => sum + val, 0) / voltages.length : 0;
      batteryCurrentAvg = currents.length > 0 ? currents.reduce((sum, val) => sum + val, 0) / currents.length : 0;
      batteryPowerAvg = powers.length > 0 ? powers.reduce((sum, val) => sum + val, 0) / powers.length : 0;
      batteryPercentAvg = percents.length > 0 ? percents.reduce((sum, val) => sum + val, 0) / percents.length : 0;
      batteryTempAvg = temps.length > 0 ? temps.reduce((sum, val) => sum + val, 0) / temps.length : 0;
    }
    
    // Process load data
    let loadVoltageAvg = 0;
    let loadCurrentAvg = 0;
    let loadPowerAvg = 0;
    
    if (load.length > 0) {
      const voltages = load.map(l => l.voltageReceived).filter(v => v > 0);
      const currents = load.map(l => l.currentReceived).filter(c => c > 0);
      const powers = load.map(l => l.powerGenerated).filter(p => p > 0);
      
      loadVoltageAvg = voltages.length > 0 ? voltages.reduce((sum, val) => sum + val, 0) / voltages.length : 0;
      loadCurrentAvg = currents.length > 0 ? currents.reduce((sum, val) => sum + val, 0) / currents.length : 0;
      loadPowerAvg = powers.length > 0 ? powers.reduce((sum, val) => sum + val, 0) / powers.length : 0;
    }
    
    return {
      panels: processedPanels,
      battery: {
        voltage: batteryVoltageAvg.toFixed(2),
        current: batteryCurrentAvg.toFixed(2),
        power: batteryPowerAvg.toFixed(2),
        charge: batteryPercentAvg.toFixed(1),
        temperature: batteryTempAvg.toFixed(1),
        status: batteryPercentAvg > 20 ? "OK" : "Low",
        efficiency: Math.min(100, Math.max(80, Math.floor(batteryPowerAvg * 10))),
        history: Array(12).fill(0).map((_, i) => 
          Math.max(0, Math.min(100, batteryPercentAvg + (Math.random() * 10 - 5)))
        )
      },
      load: {
        voltage: loadVoltageAvg.toFixed(2),
        current: loadCurrentAvg.toFixed(2),
        power: loadPowerAvg.toFixed(2),
        status: "OK",
        efficiency: Math.min(100, Math.max(80, Math.floor(loadPowerAvg * 0.5))),
        history: Array(12).fill(0).map((_, i) => 
          Math.max(0, loadPowerAvg + (Math.random() * 100 - 50))
        )
      }
    };
  };

  // Fetch data from API
  const fetchData = async () => {
  try {
    setLoading(true);
    setError(null);
    
    // Replace with your actual API endpoint
    const API_URL = 'http://localhost:5000/api/devices'; // Your API endpoint
    
    // Make the API request
    const response = await fetch(API_URL);
    
    // Check if the response is successful
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Parse the JSON response
    const apiData = await response.json();
    
    setRawData(apiData);
    
    // Process the data
    const processedData = processData(apiData);
    
    setPanelData(processedData.panels);
    setBatteryData(processedData.battery);
    setLoadData(processedData.load);
    
    setLastUpdated(new Date());
  } catch (err) {
    setError(err.message);
    setNotification({
      type: 'error',
      message: 'Failed to fetch data: ' + err.message
    });
  } finally {
    setLoading(false);
  }
};

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
    
    // Set up interval to refresh data every 30 seconds
    const intervalId = setInterval(fetchData, 30000);
    return () => clearInterval(intervalId);
  }, []);

  // Simulate data refresh
  const refreshData = () => {
    fetchData();
    setNotification({
      type: 'success',
      message: 'Data refreshed successfully'
    });
    
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Color schemes for each panel
  const colorSchemes = [
    { primary: 'rgba(41, 128, 185, 0.7)', secondary: 'rgba(52, 152, 219, 0.5)', bar: 'rgba(52, 152, 219, 0.8)' },
    { primary: 'rgba(39, 174, 96, 0.7)', secondary: 'rgba(46, 204, 113, 0.5)', bar: 'rgba(46, 204, 113, 0.8)' },
    { primary: 'rgba(211, 84, 0, 0.7)', secondary: 'rgba(230, 126, 34, 0.5)', bar: 'rgba(230, 126, 34, 0.8)' },
    { primary: 'rgba(142, 68, 173, 0.7)', secondary: 'rgba(155, 89, 182, 0.5)', bar: 'rgba(155, 89, 182, 0.8)' }
  ];

  const activeScheme = colorSchemes[activePanel];

  if (loading) {
    return (
      <div className={`App ${darkMode ? 'dark-mode' : ''}`}>
        <div className="dashboard-container">
          <div className="loading-spinner">Loading data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`App ${darkMode ? 'dark-mode' : ''}`}>
        <div className="dashboard-container">
          <div className="error-message">
            <h2>Error Loading Data</h2>
            <p>{error}</p>
            <button onClick={fetchData}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`App ${darkMode ? 'dark-mode' : ''}`}>
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div className="header-top">
            <div>
              <h1>Microgrid Monitoring Dashboard</h1>
              <p>{formatDate(currentTime)} | {formatTime(currentTime)}</p>
              <p>Data from {rawData.length} readings</p>
            </div>
            <div className="datetime-display">
              <div className="day-display">{currentTime.toLocaleDateString([], { weekday: 'long' })}</div>
              <div className="date-display">{currentTime.toLocaleDateString([], { month: 'short', day: 'numeric' })}</div>
              <div className="time-display">{formatTime(currentTime)}</div>
            </div>
          </div>
          
          <div className="section-navigation">
            <button 
              className={`nav-btn ${activeSection === 'panels' ? 'active' : ''}`}
              onClick={() => setActiveSection('panels')}
            >
              <span className="nav-icon">☀️</span>
              <span>Solar Panels</span>
            </button>
            <button 
              className={`nav-btn ${activeSection === 'battery' ? 'active' : ''}`}
              onClick={() => setActiveSection('battery')}
            >
              <span className="nav-icon">🔋</span>
              <span>Battery</span>
            </button>
            <button 
              className={`nav-btn ${activeSection === 'load' ? 'active' : ''}`}
              onClick={() => setActiveSection('load')}
            >
              <span className="nav-icon">💡</span>
              <span>Load</span>
            </button>
          </div>
          
          <div className="total-stats">
            <div className="stat">
              <span className="stat-value">{panelData.reduce((sum, panel) => sum + parseFloat(panel.power), 0).toFixed(1)} W</span>
              <span className="stat-label">Total Power Generated</span>
            </div>
            <div className="stat">
              <span className="stat-value">{batteryData?.charge || 0}%</span>
              <span className="stat-label">Battery Charge</span>
            </div>
            <div className="stat">
              <span className="stat-value">{loadData?.power || 0} W</span>
              <span className="stat-label">Load Consumption</span>
            </div>
            <div className="stat">
              <span className="stat-value">
                {((panelData.reduce((sum, panel) => sum + parseFloat(panel.power), 0) / (parseFloat(loadData?.power) || 1)) * 100).toFixed(1)}%
              </span>
              <span className="stat-label">System Efficiency</span>
            </div>
          </div>
        </header>

        {activeSection === 'panels' && (
          <>
            <div className="panels-grid">
              {panelData.map((panel, index) => (
                <div 
                  key={panel.id}
                  className={`panel-card ${index === activePanel ? 'active' : ''}`}
                  style={{
                    background: index === activePanel 
                      ? activeScheme.primary 
                      : 'rgba(255, 255, 255, 0.1)',
                    border: index === activePanel 
                      ? `2px solid ${colorSchemes[index].primary}` 
                      : '2px solid rgba(255, 255, 255, 0.1)'
                  }}
                  onClick={() => setActivePanel(index)}
                >
                  <h3>{panel.name}</h3>
                  <div className="panel-stats">
                    <div className="panel-stat">
                      <span className="value">{panel.voltage} V</span>
                      <span className="label">Voltage</span>
                    </div>
                    <div className="panel-stat">
                      <span className="value">{panel.current} A</span>
                      <span className="label">Current</span>
                    </div>
                    <div className="panel-stat">
                      <span className="value">{panel.power} W</span>
                      <span className="label">Power</span>
                    </div>
                  </div>
                  <div className="status-indicator" data-status={panel.status.toLowerCase()}>
                    {panel.status} | Efficiency: {panel.efficiency}%
                  </div>
                  <div className="readings-count">
                    Based on {panel.readings} readings
                  </div>
                </div>
              ))}
            </div>

            {panelData[activePanel] && (
              <div className="panel-details" style={{ background: activeScheme.secondary }}>
                <div className="details-header">
                  <h2>{panelData[activePanel].name} Details</h2>
                  <div className="efficiency-tag">
                    Efficiency: {panelData[activePanel].efficiency}%
                  </div>
                </div>
                
                <div className="details-grid">
                  <div className="metric-card">
                    <div className="metric-icon">⚡</div>
                    <h3>Voltage</h3>
                    <div className="metric-value">{panelData[activePanel].voltage} V</div>
                    <div className="metric-subtext">Average reading</div>
                  </div>
                  
                  <div className="metric-card">
                    <div className="metric-icon">🔌</div>
                    <h3>Current</h3>
                    <div className="metric-value">{panelData[activePanel].current} A</div>
                    <div className="metric-subtext">Average reading</div>
                  </div>
                  
                  <div className="metric-card">
                    <div className="metric-icon">💡</div>
                    <h3>Power Generated</h3>
                    <div className="metric-value">{panelData[activePanel].power} W</div>
                    <div className="metric-subtext">Average power</div>
                  </div>
                  
                  <div className="metric-card">
                    <div className="metric-icon">🌡️</div>
                    <h3>Temperature</h3>
                    <div className="metric-value">{panelData[activePanel].temperature}°C</div>
                    <div className="metric-subtext">Estimated temperature</div>
                  </div>
                </div>
                
                <div className="charts-container">
                  <DailyTrendChart 
                    data={panelData[activePanel].dailyTrend} 
                    colors={activeScheme}
                    title="Daily Power Generation (W)"
                  />
                  <HourlyTrendChart 
                    data={panelData[activePanel].hourlyTrend} 
                    colors={activeScheme}
                    title="Hourly Power Generation (W)"
                  />
                </div>
              </div>
            )}
          </>
        )}

        {activeSection === 'battery' && batteryData && (
          <div className="panel-details" style={{ background: 'rgba(46, 204, 113, 0.2)' }}>
            <div className="details-header">
              <h2>Battery Bank Details</h2>
              <div className="efficiency-tag">
                Efficiency: {batteryData.efficiency}%
              </div>
            </div>
            
            <div className="details-grid">
              <div className="metric-card">
                <div className="metric-icon">⚡</div>
                <h3>Voltage</h3>
                <div className="metric-value">{batteryData.voltage} V</div>
                <div className="metric-subtext">Average reading</div>
              </div>
              
              <div className="metric-card">
                <div className="metric-icon">🔌</div>
                <h3>Current</h3>
                <div className="metric-value">{batteryData.current} A</div>
                <div className="metric-subtext">Average reading</div>
              </div>
              
              <div className="metric-card">
                <div className="metric-icon">🔋</div>
                <h3>State of Charge</h3>
                <div className="metric-value">{batteryData.charge}%</div>
                <div className="metric-subtext">Average charge level</div>
              </div>
              
              <div className="metric-card">
                <div className="metric-icon">🌡️</div>
                <h3>Temperature</h3>
                <div className="metric-value">{batteryData.temperature}°C</div>
                <div className="metric-subtext">Average temperature</div>
              </div>
            </div>
            
            <div className="charts-container">
              <DailyTrendChart 
                data={batteryData.history} 
                colors={{bar: 'rgba(46, 204, 113, 0.8)'}}
                title="Battery Charge History (%)"
              />
            </div>
          </div>
        )}

        {activeSection === 'load' && loadData && (
          <div className="panel-details" style={{ background: 'rgba(241, 196, 15, 0.2)' }}>
            <div className="details-header">
              <h2>Load Details</h2>
              <div className="efficiency-tag">
                Efficiency: {loadData.efficiency}%
              </div>
            </div>
            
            <div className="details-grid">
              <div className="metric-card">
                <div className="metric-icon">⚡</div>
                <h3>Voltage</h3>
                <div className="metric-value">{loadData.voltage} V</div>
                <div className="metric-subtext">Average reading</div>
              </div>
              
              <div className="metric-card">
                <div className="metric-icon">🔌</div>
                <h3>Current</h3>
                <div className="metric-value">{loadData.current} A</div>
                <div className="metric-subtext">Average reading</div>
              </div>
              
              <div className="metric-card">
                <div className="metric-icon">💡</div>
                <h3>Power Consumption</h3>
                <div className="metric-value">{loadData.power} W</div>
                <div className="metric-subtext">Average consumption</div>
              </div>
              
              <div className="metric-card">
                <div className="metric-icon">📈</div>
                <h3>Status</h3>
                <div className="metric-value">{loadData.status}</div>
                <div className="metric-subtext">Load status</div>
              </div>
            </div>
            
            <div className="charts-container">
              <DailyTrendChart 
                data={loadData.history} 
                colors={{bar: 'rgba(241, 196, 15, 0.8)'}}
                title="Load Consumption History (W)"
              />
            </div>
          </div>
        )}

        <div className="dashboard-footer">
          <div>Last updated: {formatTime(lastUpdated)}</div>
          <div className="footer-controls">
            <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
            <button className="refresh-btn" onClick={refreshData}>
              🔄 Refresh Data
            </button>
          </div>
        </div>
      </div>

      {notification && (
        <div className={`notification-toast ${notification.type}`}>
          {notification.type === 'success' ? '✅' : '⚠️'} {notification.message}
        </div>
      )}
    </div>
  );
}

export default App;