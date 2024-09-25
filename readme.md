# Sports Data Processor

A TypeScript library for processing and consolidating data from professional athletes' sports computers. It loads summary, laps, and samples data, processes heart rate measurements, and outputs a unified JSON suitable for scientific analysis.

## Features

- Data Loading: Load summary, samples, and laps data via dedicated methods.
- Data Processing: Consolidate loaded data into a unified JSON output.
  Heart Rate Data Pre-processing:
- Identify and clean outliers in heart rate data.
- Reverse median aggregation and interpolate data to achieve a recording rate of 1.
- Extensible Architecture: Modular design for easy extension and maintenance.
- Comprehensive Testing: Over 80% test coverage using Jest.

## Installation

```bash
# Clone the repository
git clone <https://github.com/bartosz0718/airow-test.git>
cd airow-test

# Install dependencies
yarn install
```

## Usage

### Data Loading

Create an instance of SportsDataProcessor and load your data:

```
import { SportsDataProcessor } from './src/index';
import { SummaryData, SampleData, LapData } from './src/types';

const processor = new SportsDataProcessor();

// Load Summary Data
const summaryData: SummaryData = {
  userId: '1234567890',
  activityId: 9480958402,
  activityName: 'Indoor Cycling',
  durationInSeconds: 3667,
  startTimeInSeconds: 1661158927,
  startTimeOffsetInSeconds: 7200,
  activityType: 'INDOOR_CYCLING',
  averageHeartRateInBeatsPerMinute: 150,
  activeKilocalories: 561,
  deviceName: 'instinct2',
  maxHeartRateInBeatsPerMinute: 190,
};

processor.loadSummaryData(summaryData);

// Load Samples Data
const samplesData: SampleData[] = [
  {
    "recording-rate": 5,
    "sample-type": "2",
    "data": "120,126,122,140,142,155,145"
  },
  // ... more sample data
];

processor.loadSamplesData(samplesData);

// Load Laps Data
const lapsData: LapData[] = [
  {
    "startTimeInSeconds": 1661158927,
    "airTemperatureCelsius": 28,
    "heartRate": 109,
    "totalDistanceInMeters": 15,
    "timerDurationInSeconds": 600
  },
  // ... more lap data
];

processor.loadLapsData(lapsData);
```

### Processing Data

process the loaded data and get the consolidated JSON output:

```
const processedData = processor.process();
```

**Sample Output**

```
{
  "activityOverview": {
    "userId": "1234567890",
    "activityType": "INDOOR_CYCLING",
    "deviceName": "instinct2",
    "maxHeartRateInBeatsPerMinute": 190,
    "durationInSeconds": 3667
  },
  "laps": [
    {
      "startTimeInSeconds": 1661158927,
      "totalDistanceInMeters": 15,
      "timerDurationInSeconds": 600,
      "heartRateSamples": [
        { "sampleIndex": 0, "heartRate": 120 },
        { "sampleIndex": 1, "heartRate": 122 },
        // ... more heart rate samples
      ]
    },
    // ... more laps
  ]
}

```

## API Reference

### Classes

`SportsDataProcessor`

- Methods:
  - `loadSummaryData(data: SummaryData): void`
  - `loadSamplesData(data: SampleData[]): voide`
  - `loadLapsData(data: LapData[]): void`
  - `process(): ProcessedData`

### Interfaces

```
interface SummaryData {
  userId: string;
  activityId: number;
  activityName: string;
  durationInSeconds: number;
  startTimeInSeconds: number;
  startTimeOffsetInSeconds: number;
  activityType: string;
  averageHeartRateInBeatsPerMinute: number;
  activeKilocalories: number;
  deviceName: string;
  maxHeartRateInBeatsPerMinute: number;
}

interface SampleData {
  "recording-rate": number;
  "sample-type": string;
  data: string;
}

interface LapData {
  startTimeInSeconds: number;
  airTemperatureCelsius: number;
  heartRate: number;
  totalDistanceInMeters: number;
  timerDurationInSeconds: number;
}

interface ProcessedData {
  activityOverview: {
    userId: string;
    activityType: string;
    deviceName: string;
    maxHeartRateInBeatsPerMinute: number;
    durationInSeconds: number;
  };
  laps: ProcessedLap[];
}

interface ProcessedLap {
  startTimeInSeconds: number;
  totalDistanceInMeters: number;
  timerDurationInSeconds: number;
  heartRateSamples: ProcessedHeartRateSample[];
}

interface ProcessedHeartRateSample {
  sampleIndex: number;
  heartRate: number;
}

```

## Data Processing Details

### Heart Rate Sample Extraction

- Filtering: Extract samples with `"sample-type": "2"`
- Grouping: Process samples in pairs (two per lap for `INDOOR_CYCLING`)
- Combinding Data: Concatenate data strings and split into arrays

### Data Cleaning

- Conversion: Convert string values to numbers.
- Outlier Removal: Remove null and non-numeric entries.
- Outlier Identification: Future enhancement can include statistical methods to detect outliers.

### Reverse Aggregation and interpolation

- Objective: Reverse the median aggregation of heart rate measurements.
- Method:
  - Perform linear interpolation between data points.
  - Generate measurements at a recording rate of 1.
  - Result in 5 \* (n - 1) measurements, where n is the number of original observations.

## Testing

### Running Tests

```bash
yarn test
yarn test:coverage
```

### Sample Test Output

```
$ jest
 PASS  tests/index.test.ts
  SportsDataProcessor
    √ throws error when summary data is not loaded (45 ms)
    √ processes data correctly (52 ms)
    √ handles empty samples data (2 ms)
    √ handles invalid heart rate data (1 ms)

----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------|---------|----------|---------|---------|-------------------
All files |   96.15 |    88.88 |     100 |   95.83 |
 index.ts |   96.15 |    88.88 |     100 |   95.83 | 76-77
----------|---------|----------|---------|---------|-------------------
Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
Snapshots:   0 total
Time:        9.61 s
Ran all test suites.
Done in 11.15s.
```
