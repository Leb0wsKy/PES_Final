<a name="readme-top"></a>

<div align="center">

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]](https://www.linkedin.com/in/chater-marzougui-342125299/)
</div>

# ⚡ PV Monitoring & Fault Detection System

**Real-Time Simulation of Photovoltaic Panel Performance for Microgrids Using Processor-in-the-Loop (PIL) Testing**  
Built with ❤️ using MATLAB Simulink, AI/ML, and STM32 microcontrollers.

<br />
<div align="center">
  <a href="https://github.com/chater-marzougui/Real-Time-Simulation-of-Photovoltaic-Panel-Performance-Using-Processor-in-the-Loop-Matlab">
     <img src="./Images/logo.svg" alt="PV System Logo" width="256" height="256">
  </a>
  <a href="https://github.com/chater-marzougui/Real-Time-Simulation-of-Photovoltaic-Panel-Performance-Using-Processor-in-the-Loop-Matlab">
    <h1 width="35px">PV Monitoring & Fault Detection System
    </h1>
  </a>
  <p align="center">
    Advanced fault detection for photovoltaic systems using Digital Twin technology and AI-powered analytics
    <br />
    <br />
    <a href="https://github.com/chater-marzougui/Real-Time-Simulation-of-Photovoltaic-Panel-Performance-Using-Processor-in-the-Loop-Matlab/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    ·
    <a href="https://github.com/chater-marzougui/Real-Time-Simulation-of-Photovoltaic-Panel-Performance-Using-Processor-in-the-Loop-Matlab/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>

<br/>

---

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#-about-the-project">About The Project</a></li>
    <li><a href="#-features">Features</a></li>
    <li><a href="#-system-architecture">System Architecture</a></li>
    <li><a href="#-tech-stack">Tech Stack</a></li>
    <li><a href="#-project-structure">Project Structure</a></li>
    <li><a href="#-installation">Installation</a></li>
    <li><a href="#-how-to-use">How to Use</a></li>
    <li><a href="#-ml-models-performance">ML Models Performance</a></li>
    <li><a href="#-pil-implementation">PIL Implementation</a></li>
    <li><a href="#-simulation-results">Simulation Results</a></li>
    <li><a href="#-troubleshooting">Troubleshooting</a></li>
    <li><a href="#-license">License</a></li>
    <li><a href="#-contributing">Contributing</a></li>
    <li><a href="#-contact">Contact</a></li>
    <li><a href="#-disclaimer">Disclaimer</a></li>
  </ol>
</details>

<div align="right">
  <a href="#readme-top">
    <img src="https://img.shields.io/badge/Back_to_Top-⬆️-blue?style=for-the-badge" alt="Back to Top">
  </a>
</div>

---

## 🔋 About The Project

The **PV Fault Detection System** is an advanced real-time simulation and monitoring solution for photovoltaic panels in microgrids. This project combines Digital Twin technology with Processor-in-the-Loop (PIL) testing to provide comprehensive fault detection, AI-powered analytics, and embedded system validation.

Growing energy demand and climate concerns drive the shift to renewable sources. Solar panels in microgrids offer energy independence, cost savings, and resilience, especially in remote areas. However, PV systems face issues like shading, temperature changes, dust, degradation, and undetected faults that can significantly reduce efficiency and economic benefits.

Our solution addresses these challenges by developing a real-time virtual system that combines Digital Twin technology with PIL testing for PV system modeling, control optimization, AI fault detection, embedded validation, and predictive maintenance.

### 🎯 Key Objectives

- **Real-time PV system modeling** using MATLAB Simulink/Simscape
- **AI-powered fault detection** with 98.90% accuracy using Random Forest
- **Digital Twin integration** for predictive maintenance
- **Embedded system validation** on STM32 microcontrollers
- **Comprehensive fault simulation** (Short Circuit, Open Circuit, Partial Shading)

<div align="center">
   <img src="./Images/pv_pipeline.svg" alt="System Architecture Overview" width="90%">
   <p><em>Complete system architecture showing Digital Twin integration with PIL testing</em></p>
</div>

<div align="right">
  <a href="#readme-top">
    <img src="https://img.shields.io/badge/Back_to_Top-⬆️-blue?style=for-the-badge" alt="Back to Top">
  </a>
</div>

---

## ✨ Features

### 🔄 **Advanced Simulation & Modeling**
- **Real-time PV panel simulation** using MATLAB Simulink/Simscape
- **Dynamic environmental conditions** with Tunisia-specific irradiance profiles
- **MPPT algorithm implementation** using Perturb & Observe method
- **Comprehensive fault modeling** for SC, OC, and PS scenarios

### 🤖 **AI-Powered Fault Detection**
- **Machine learning models** trained on 5.8M data points (11 years of simulated data)
- **98.90% accuracy** achieved with Random Forest classifier
- **Multiple ML algorithms** tested and compared (RF, LightGBM, XGBoost, LSTM)
- **Real-time inference** optimized for embedded deployment

### 🔧 **Digital Twin Technology**
- **Virtual PV system replica** for predictive maintenance
- **Historical data analysis** and pattern recognition
- **Performance optimization** through continuous monitoring
- **Fault prediction** before critical failures occur

### 💻 **Embedded System Integration**
- **Processor-in-the-Loop (PIL)** testing on STM32F4 Discovery
- **Real-time communication** via UART at 115200 bps
- **Optimized code deployment** (128 KB Flash, 24 KB RAM)
- **Hardware-software co-design** validation

### 📊 **Comprehensive Analysis**
- **24-hour simulation cycles** with realistic fault scenarios
- **Performance metrics** including accuracy, training time, and model size
- **Confusion matrix analysis** for detailed model evaluation
- **Time-series data generation** for ML training

<div align="right">
  <a href="#readme-top">
    <img src="https://img.shields.io/badge/Back_to_Top-⬆️-blue?style=for-the-badge" alt="Back to Top">
  </a>
</div>

---

## 🏛️ System Architecture

<div align="center">
   <img src="./Images/pv_simulation_workflow.svg" alt="Digital Twin Architecture" width="90%">
   <p><em>Digital Twin Architecture showing the complete workflow from simulation to embedded deployment</em></p>
</div>

Our system architecture consists of four main components:

1. **Physical PV System Simulation** - MATLAB Simulink/Simscape models
2. **Digital Twin Platform** - Virtual representation and monitoring
3. **AI/ML Processing** - Fault detection and classification algorithms
4. **Embedded Validation** - STM32-based PIL testing and deployment

The architecture enables seamless integration between simulation, AI processing, and hardware validation, providing a comprehensive solution for PV system monitoring and fault detection.

<div align="right">
  <a href="#readme-top">
    <img src="https://img.shields.io/badge/Back_to_Top-⬆️-blue?style=for-the-badge" alt="Back to Top">
  </a>
</div>

---

## 🧠 Tech Stack

| Component | Technologies |
|-----------|--------------|
| **Simulation** | MATLAB Simulink/Simscape, STM32CubeMX |
| **AI/ML** | Python, Random Forest, LightGBM, XGBoost, LSTM |
| **Embedded Systems** | STM32F4 Discovery, ARM Cortex-M4, UART Communication |
| **Data Processing** | Pandas, NumPy, Scikit-learn |
| **Visualization** | Matplotlib, Seaborn |
| **Hardware** | STM32F407VG, ST-Link Debugger |
| **Development** | Git, MATLAB R2023a+, STM32CubeIDE |

<div align="right">
  <a href="#readme-top">
    <img src="https://img.shields.io/badge/Back_to_Top-⬆️-blue?style=for-the-badge" alt="Back to Top">
  </a>
</div>

---

## 📂 Project Structure

```
pv-fault-detection/
├── Simulink_Matlab/
│    ├── Irr_temp_ariana.csv                # Tunisia-specific solar data
│    ├── PV_Array_Clean.slx                 # Healthy PV system model
│    ├── PV_Array_Code_Gen_PIL.slx          # PIL-ready model
│    ├── PV_Array_PIL_host_interface.mlx    # PIL communication code
│    ├── PV_Array_With_Faults.mdl           # Fault injection Simulink model 
│    └── PV_Array_Workspace.mlx             # Input & Output data manipulator (Workspace)
├── ML_Models/
│   ├── PV_Folder/                  # Saved model files & Comparaisons
│   └── PV_Array.py                 # Models Training, Testing, Evaluating & Comparaisons
├── PIL/
│   ├── stm32_project/              # STM32CubeIDE project
│   ├── pil_interface/               
│   └── uart_communication/         # Serial communication setup
├── Images/
│   ├── pv_simulation_workflow.svg  # System architecture diagram
│   ├── mlcomp.gif                  # ML models comparison
│   ├── pv_pipeline.svg             # Whole system workflow
│   └── pil_testing_diagram.svg     # PIL implementation workflow
├── docs/
│   └──p2m.pdf                      # Complete technical documentation
├── requirements.txt                # Python dependencies
├── .gitignore                      # Githubs Ignore files list
├── LICENSE                         # Projects License
└── README.md                       # This file

```

<div align="right">
  <a href="#readme-top">
    <img src="https://img.shields.io/badge/Back_to_Top-⬆️-blue?style=for-the-badge" alt="Back to Top">
  </a>
</div>

---

## ⚡ Installation

### Prerequisites

- **MATLAB R2023a or later** with Simulink and Simscape Electrical
- **Python 3.8+** for ML model training and evaluation
- **STM32CubeIDE** for embedded development
- **STM32F4 Discovery Kit** for PIL testing

### Step 1: Clone the Repository
```bash
git clone https://github.com/chater-marzougui/Real-Time-Simulation-of-Photovoltaic-Panel-Performance-Using-Processor-in-the-Loop-Matlab.git
cd Real-Ti (hit Tab)
```

### Step 2: Set Up Python Environment
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 3: MATLAB Setup
1. Open MATLAB and navigate to the project directory
2. Add the project folder and subfolders to MATLAB path
3. Ensure required toolboxes are installed:
   - Simulink
   - Simscape Electrical
   - Embedded Coder
   - Simulink Support Package for STM32

### Step 4: STM32 Setup
1. Install STM32CubeIDE
2. Connect STM32F4 Discovery board via USB
3. Open the project in `embedded_code/stm32_project/`
4. Build and flash the initial firmware

<div align="right">
  <a href="#readme-top">
    <img src="https://img.shields.io/badge/Back_to_Top-⬆️-blue?style=for-the-badge" alt="Back to Top">
  </a>
</div>

---

## 🧑‍💻 How to Use

### 1. **Data Generation**
Generate simulation data for ML training:
```bash
cd ml_models/data_generation
python generate_dataset.py
```

### 2. **Model Training**
Train and compare different ML models:
```bash
cd ml_models/training
python train_models.py
python model_comparison.py
```

### 3. **Simulink Simulation**
1. Open `simulink_models/pv_system_with_faults.slx` in MATLAB
2. Configure simulation parameters:
   - Simulation time: 86400 seconds (24 hours)
   - Solver: Fixed-step, ode4
   - Step size: 1 second
3. Run the simulation to observe fault scenarios

### 4. **PIL Testing**
1. Open `simulink_models/pil_model.slx`
2. Configure PIL settings:
   - Target: STM32F4 Discovery
   - Communication: Serial (115200 bps)
3. Build and deploy to STM32
4. Run PIL simulation for real-time validation

### 5. **Results Analysis**
Evaluate model performance and generate reports:
```bash
cd ml_models/evaluation
python confusion_matrices.py
python performance_metrics.py
```

<div align="right">
  <a href="#readme-top">
    <img src="https://img.shields.io/badge/Back_to_Top-⬆️-blue?style=for-the-badge" alt="Back to Top">
  </a>
</div>

---

## 📊 ML Models Performance

<div align="center">
   <img src="./Images/mlcomp.gif" alt="ML Models Performance Comparison" width="90%">
   <p><em>Comprehensive comparison of machine learning models showing accuracy, training time, and model size</em></p>
</div>

### Performance Summary

| Model | Accuracy (%) | Training Time (s) | Inference Time (s) | Model Size |
|-------|--------------|-------------------|-------------------|------------|
| **Random Forest** | **98.90** | 29.07 | 1.69 | 125 MB |
| **LightGBM** | 98.83 | **4.35** | 5.77 | **1.72 MB** |
| **Gradient Boost** | 98.70 | 465.63 | 3.70 | **634 KB** |
| **HistGB** | 98.55 | 9.67 | 12.10 | 1.78 MB |
| **XGBoost** | 98.00 | 2.23 | **1.12** | 1.3 MB |
| **LSTM** | 95.37 | 4823.67 | 44.22 | 488 KB |

### Key Insights

- **Random Forest** achieved the highest accuracy at 98.90% but with the largest model size
- **LightGBM** provides the best balance of accuracy (98.83%) and model size (1.72 MB)
- **Tree-based ensembles** significantly outperformed deep learning approaches
- All models excel at identifying **healthy panels** and **short circuit faults**
- The most challenging classification is between **partial shading** and **no production** states

<div align="right">
  <a href="#readme-top">
    <img src="https://img.shields.io/badge/Back_to_Top-⬆️-blue?style=for-the-badge" alt="Back to Top">
  </a>
</div>

---

## 🔧 PIL Implementation

<div align="center">
   <img src="./Images/pil_testing_diagram.gif" alt="Processor-in-the-Loop Workflow" width="90%">
   <p><em>Complete PIL testing workflow showing communication between MATLAB Simulink and STM32 microcontroller</em></p>
</div>

### PIL Testing Workflow

1. **Model Preparation**: Core PV model encapsulated for code generation
2. **Code Generation**: Simulink generates C code optimized for STM32F4
3. **Hardware Deployment**: Code flashed to STM32F4 Discovery via ST-Link
4. **Real-time Communication**: UART communication at 115200 bps
5. **Validation**: Real-time performance verification and timing analysis

### Hardware Requirements

- **STM32F4 Discovery Kit** with STM32F407VG microcontroller
- **ARM Cortex-M4** core running at 168 MHz
- **1 MB Flash memory** and **192 KB RAM**
- **USB connection** for ST-Link debugging and communication

### Resource Utilization

- **Flash Memory**: 128 KB (12.8% of total)
- **RAM Usage**: 24 KB (12.5% of total)
- **Communication**: UART2 at 115200 bps
- **Real-time Performance**: Validated with stable serial communication

<div align="right">
  <a href="#readme-top">
    <img src="https://img.shields.io/badge/Back_to_Top-⬆️-blue?style=for-the-badge" alt="Back to Top">
  </a>
</div>

---

## 📈 Simulation Results

### Fault Scenarios Analysis

Our comprehensive simulation study covers three major fault types across complete 24-hour cycles:

#### 1. **Open Circuit Fault**
- **Signature**: Complete cessation of power generation during solar irradiance periods
- **Characteristics**: Flat-line power output contrasting with normal bell-shaped curve
- **Impact**: Total loss of energy generation from affected panels

#### 2. **Short Circuit Fault**  
- **Signature**: Significantly reduced power output with current surges
- **Characteristics**: Bypassed normal load path resulting in substantial energy losses
- **Impact**: Dramatic reduction in system efficiency and potential safety hazards

#### 3. **Partial Shading Fault**
- **Signature**: Complex power curve distortion with multiple local maxima
- **Characteristics**: Reduced overall efficiency challenging traditional MPPT algorithms
- **Impact**: Suboptimal power extraction and system performance degradation

### Dataset Characteristics

- **Total Size**: 5.8 million data points
- **Simulation Period**: 11 years of equivalent operation
- **Sampling Rate**: 5-minute intervals for high temporal resolution
- **Features**: 10 parameters including environmental and electrical measurements
- **Fault Distribution**: Realistic probability-based fault injection (4% per step)

<div align="right">
  <a href="#readme-top">
    <img src="https://img.shields.io/badge/Back_to_Top-⬆️-blue?style=for-the-badge" alt="Back to Top">
  </a>
</div>

---

## 🔧 Troubleshooting

### Common Issues

**MATLAB Simulation Issues:**
- Ensure all required toolboxes are installed and licensed
- Check Simulink model compatibility with your MATLAB version
- Verify Simscape Electrical library is properly loaded
- Update block parameters if using different PV panel specifications

**Python ML Training Issues:**
- Verify all dependencies are installed: `pip install -r requirements.txt`
- Check Python version compatibility (3.8+ required)
- Ensure sufficient RAM for large dataset processing (8GB+ recommended)
- Monitor disk space for model training and data storage

**STM32 PIL Testing Issues:**
- Confirm STM32F4 Discovery board is properly connected
- Check ST-Link drivers are installed and up to date
- Verify COM port settings and baud rate (115200 bps)
- Ensure STM32CubeIDE project builds without errors
- Check UART2 configuration matches Simulink settings

**Communication Problems:**
- Test serial communication independently before PIL testing
- Verify UART pins and peripheral configuration
- Check for conflicting COM port usage
- Monitor data format consistency between MATLAB and STM32

**Performance Issues:**
- Optimize model complexity for real-time constraints
- Consider model quantization for embedded deployment
- Profile code execution time on target hardware
- Adjust sampling rates based on system requirements

<div align="right">
  <a href="#readme-top">
    <img src="https://img.shields.io/badge/Back_to_Top-⬆️-blue?style=for-the-badge" alt="Back to Top">
  </a>
</div>

---

## 📃 License

MIT License — free to use, modify, and build upon for educational and commercial purposes.

<div align="right">
  <a href="#readme-top">
    <img src="https://img.shields.io/badge/Back_to_Top-⬆️-blue?style=for-the-badge" alt="Back to Top">
  </a>
</div>

---

## 🤝 Contributing

Contributions are welcome! We're particularly interested in:

- **New fault detection algorithms** and ML model improvements
- **Additional PV panel models** and configurations
- **Extended embedded platform support** beyond STM32F4
- **Real-world validation** with physical PV systems
- **Performance optimizations** for edge deployment
- **Documentation improvements** and tutorial content

Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

<div align="right">
  <a href="#readme-top">
    <img src="https://img.shields.io/badge/Back_to_Top-⬆️-blue?style=for-the-badge" alt="Back to Top">
  </a>
</div>

---

## 📧 Contact

**Chater Marzougui** - [@Chater-marzougui](https://linkedin.com/in/chater-marzougui-342125299) - chater.mrezgui2002@gmail.com

**Hibatollah Gouiaa** - [@Hibatollah-Gouiaa](https://www.linkedin.com/in/hibatollah-gouiaa-325a88295/) - hibatollah.gouiaa@supcom.tn

**Project Supervisors:**
- Fatma Rouissi
- Rim Barrak

<div align="right">
  <a href="#readme-top">
    <img src="https://img.shields.io/badge/Back_to_Top-⬆️-blue?style=for-the-badge" alt="Back to Top">
  </a>
</div>

---

## ☢️ Disclaimer

This project is developed for educational and research purposes. While the system demonstrates effective fault detection capabilities in simulation, real-world deployment should include additional safety measures and compliance with relevant electrical safety standards. Users are responsible for ensuring their implementation meets all applicable regulations and safety requirements.

The AI models and fault detection algorithms should be validated with real PV system data before deployment in critical applications. The developers assume no responsibility for any damages or losses resulting from the use of this software in production environments.

<div align="right">
  <a href="#readme-top">
    <img src="https://img.shields.io/badge/Back_to_Top-⬆️-blue?style=for-the-badge" alt="Back to Top">
  </a>
</div>

---

⚡ _Advancing renewable energy through intelligent fault detection and predictive maintenance._

<!-- Markdown links & images -->
[contributors-shield]: https://img.shields.io/github/contributors/chater-marzougui/Real-Time-Simulation-of-Photovoltaic-Panel-Performance-Using-Processor-in-the-Loop-Matlab.svg?style=for-the-badge
[contributors-url]: https://github.com/chater-marzougui/Real-Time-Simulation-of-Photovoltaic-Panel-Performance-Using-Processor-in-the-Loop-Matlab/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/chater-marzougui/Real-Time-Simulation-of-Photovoltaic-Panel-Performance-Using-Processor-in-the-Loop-Matlab.svg?style=for-the-badge
[forks-url]: https://github.com/chater-marzougui/Real-Time-Simulation-of-Photovoltaic-Panel-Performance-Using-Processor-in-the-Loop-Matlab/network/members
[stars-shield]: https://img.shields.io/github/stars/chater-marzougui/Real-Time-Simulation-of-Photovoltaic-Panel-Performance-Using-Processor-in-the-Loop-Matlab.svg?style=for-the-badge
[stars-url]: https://github.com/chater-marzougui/Real-Time-Simulation-of-Photovoltaic-Panel-Performance-Using-Processor-in-the-Loop-Matlab/stargazers
[issues-shield]: https://img.shields.io/github/issues/chater-marzougui/Real-Time-Simulation-of-Photovoltaic-Panel-Performance-Using-Processor-in-the-Loop-Matlab.svg?style=for-the-badge
[issues-url]: https://github.com/chater-marzougui/Real-Time-Simulation-of-Photovoltaic-Panel-Performance-Using-Processor-in-the-Loop-Matlab/issues
[license-shield]: https://img.shields.io/github/license/chater-marzougui/Real-Time-Simulation-of-Photovoltaic-Panel-Performance-Using-Processor-in-the-Loop-Matlab.svg?style=for-the-badge
[license-url]: https://github.com/chater-marzougui/Real-Time-Simulation-of-Photovoltaic-Panel-Performance-Using-Processor-in-the-Loop-Matlab/blob/master/LICENSE
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555