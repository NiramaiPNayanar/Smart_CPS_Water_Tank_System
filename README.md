# Smart CPS Water Tank System

This repository contains the early-stage prototype of a Cyber-Physical System (CPS)–based Smart Water Tank Monitoring and Management System. The project explored sensor integration, IoT connectivity, database-backed data storage, and automated water-level management workflows.  
The initial development was done as part of an early product ideation activity in collaboration with the team at Eshwar Tanks (https://www.eshwartanks.com/).  
Note: The system may have evolved significantly after my involvement.

## Overview 
 
The Smart CPS Water Tank System was intended to test the feasibility of:

- Real-time monitoring of water tank levels  
- Secure transmission of sensor data using IoT communication protocols  
- Persistent storage using MongoDB with access authentication  
- Remote visibility through basic dashboards or mobile interfaces  
- Prototype automation logic for pump control  
- Stability and reliability tests in practical environments  

All content in this repository reflects the prototype phase only and is not intended for production deployment.

## Features (Prototype Stage)

- IoT-based communication for transmitting sensor readings  
- Integration of ultrasonic or float sensors during testing phases  
- MongoDB database configured with user authentication for secure data storage  
- Basic Node.js backend for receiving, validating, and storing sensor data  
- Concepts for both local and remote monitoring dashboards  
- Initial automation rules for motor or pump operation  
- Modular architecture planned for future expansion  

## Tech Stack

- **Microcontrollers:** Arduino / ESP-based boards  
- **Backend:** Node.js (Express)  
- **Database:** MongoDB with authentication and role-based access  
- **Communication:** WiFi, HTTP, or MQTT depending on testing stage  
- **Visualization:** Early prototype dashboards / UI mockups  
- **Architecture:** CPS workflow (perception → transmission → computation → actuation)

## Repository Structure


## MongoDB Usage (Prototype Phase)

- Used MongoDB for storing sensor readings and system logs.  
- Database access was secured using MongoDB user authentication.  
- Role-based privileges were used to limit write, read, and administrative operations.  
- Connection strings were managed using environment variables for safety.  

Example structure (prototype level):

```json
{
  "timestamp": "2025-01-10T12:35:29Z",
  "water_level": 72.5,
  "pump_status": "OFF",
  "source": "tank-sensor-1"
}
```

## Important Notes
  - The system design and code here represent only the initial prototype.
  - The commercial or production version may differ entirely.
  - This repository exists for documentation, experimentation, and learning purposes only.
  - Nothing in this repository should be interpreted as reflecting the final product decisions of any company or team.

## License – BSD 3-Clause License
  This license ensures:
  - You are not liable for any usage, modifications, or deployments made by others.
  - Your name cannot be used to endorse or promote derivative products.
  - The prototype remains open for learning and reference.
