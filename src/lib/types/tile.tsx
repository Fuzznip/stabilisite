export type Tile = {
  id: string;
  name: string;
  task1: Task;
  task2: Task;
  task3: Task;
  tile: number;
  doubleRow?: boolean;
  doubleCol?: boolean;
};

export type Task = {
  description: string;
  target: number;
};
