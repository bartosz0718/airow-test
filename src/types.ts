export interface SummaryData {
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

export interface SampleData {
  "recording-rate": number;
  "sample-type": string;
  data: string;
}

export interface LapData {
  startTimeInSeconds: number;
  airTemperatureCelsius: number;
  heartRate: number;
  totalDistanceInMeters: number;
  timerDurationInSeconds: number;
}

export interface ProcessedHeartRateSample {
  sampleIndex: number;
  heartRate: number;
}

export interface ProcessedLap {
  startTimeInSeconds: number;
  totalDistanceInMeters: number;
  timerDurationInSeconds: number;
  heartRateSamples: ProcessedHeartRateSample[];
}

export interface ProcessedData {
  activityOverview: {
    userId: string;
    activityType: string;
    deviceName: string;
    maxHeartRateInBeatsPerMinute: number;
    durationInSeconds: number;
  };
  laps: ProcessedLap[];
}
