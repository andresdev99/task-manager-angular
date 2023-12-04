export interface Task {
  id: number;
  task: string;
  checked: boolean;
  editing?: boolean;
}
