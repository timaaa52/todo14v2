import {TasksStateType} from '../App';
import {v1} from 'uuid';
import {AddTodolistActionType, RemoveTodolistActionType, setTodolistsACType} from './todolists-reducer';
import {TaskPriorities, TaskStatuses, TaskType, todolistsAPI, UpdateTaskModelType} from '../api/todolists-api'
import {Dispatch} from "redux";
import {AppRootStateType} from "./store";

export type RemoveTaskActionType = {
    type: 'REMOVE-TASK',
    todolistId: string
    taskId: string
}

export type AddTaskActionType = {
    type: 'ADD-TASK',
    task: TaskType
}

export type ChangeTaskStatusActionType = {
    type: 'CHANGE-TASK-STATUS',
    todolistId: string
    taskId: string
    status: TaskStatuses
}

export type ChangeTaskTitleActionType = {
    type: 'CHANGE-TASK-TITLE',
    todolistId: string
    taskId: string
    title: string
}

type ActionsType = RemoveTaskActionType | AddTaskActionType
    | ChangeTaskStatusActionType
    | ChangeTaskTitleActionType
    | AddTodolistActionType
    | RemoveTodolistActionType
    | setTodolistsACType
    | getTasksACType

const initialState: TasksStateType = {
    /*"todolistId1": [
        { id: "1", title: "CSS", status: TaskStatuses.New, todoListId: "todolistId1", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low },
        { id: "2", title: "JS", status: TaskStatuses.Completed, todoListId: "todolistId1", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low },
        { id: "3", title: "React", status: TaskStatuses.New, todoListId: "todolistId1", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low }
    ],
    "todolistId2": [
        { id: "1", title: "bread", status: TaskStatuses.New, todoListId: "todolistId2", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low },
        { id: "2", title: "milk", status: TaskStatuses.Completed, todoListId: "todolistId2", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low },
        { id: "3", title: "tea", status: TaskStatuses.New, todoListId: "todolistId2", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low }
    ]*/

}

export const tasksReducer = (state: TasksStateType = initialState, action: ActionsType): TasksStateType => {
    switch (action.type) {

        case "SET-TASKS": {
            let copyState = {...state}
            copyState[action.todoId] = action.tasks
            return copyState
            debugger
        }
        case "SET_TODOLISTS": {
            let copyState = {...state};
            action.todos.forEach(tl => copyState[tl.id] = [])
            return copyState
        }
        case 'REMOVE-TASK': {
            const stateCopy = {...state}
            const tasks = stateCopy[action.todolistId];
            const newTasks = tasks.filter(t => t.id !== action.taskId);
            stateCopy[action.todolistId] = newTasks;
            return stateCopy;
        }
        case 'ADD-TASK': {
            const stateCopy = {...state}
            const newTask: TaskType = action.task
            const tasks = stateCopy[action.task.todoListId];
            const newTasks = [newTask, ...tasks];
            stateCopy[action.task.todoListId] = newTasks;
            return stateCopy;
        }
        case 'CHANGE-TASK-STATUS': {
            let todolistTasks = state[action.todolistId];
            let newTasksArray = todolistTasks
                .map(t => t.id === action.taskId ? {...t, status: action.status} : t);

            state[action.todolistId] = newTasksArray;
            return ({...state});
        }
        case 'CHANGE-TASK-TITLE': {
            let todolistTasks = state[action.todolistId];
            // найдём нужную таску:
            let newTasksArray = todolistTasks
                .map(t => t.id === action.taskId ? {...t, title: action.title} : t);

            state[action.todolistId] = newTasksArray;
            return ({...state});
        }
        case 'ADD-TODOLIST': {
            return {
                ...state,
                [action.todolistId]: []
            }
        }
        case 'REMOVE-TODOLIST': {
            const copyState = {...state};
            delete copyState[action.id];
            return copyState;
        }
        default:
            return state;
    }
}

export const removeTaskAC = (taskId: string, todolistId: string): RemoveTaskActionType => {
    return {type: 'REMOVE-TASK', taskId: taskId, todolistId: todolistId}
}
export const addTaskAC = (task: TaskType): AddTaskActionType => {
    return {type: 'ADD-TASK', task}
}
export const changeTaskStatusAC = (taskId: string, status: TaskStatuses, todolistId: string): ChangeTaskStatusActionType => {
    return {type: 'CHANGE-TASK-STATUS', status, todolistId, taskId}
}
export const changeTaskTitleAC = (taskId: string, title: string, todolistId: string): ChangeTaskTitleActionType => {
    return {type: 'CHANGE-TASK-TITLE', title, todolistId, taskId}
}

type getTasksACType = ReturnType<typeof setTasksAC>
export const setTasksAC = (tasks: TaskType[], todoId: string) => {
    return {
        type: 'SET-TASKS',
        tasks,
        todoId,
    } as const
}

export const fetchTasksTC = (todoId: string) => {
    return (dispatch: Dispatch) => {
        todolistsAPI.getTasks(todoId)
            .then(res => {
                dispatch(setTasksAC(res.data.items, todoId))
            })
    }
}

export const removeTaskTC = (todoId: string, taskId: string) => {
    return (dispatch: Dispatch) => {
        todolistsAPI.deleteTask(todoId, taskId)
            .then(res => {
                dispatch(removeTaskAC(taskId, todoId));
            })
    }
}

export const addTaskTC = (todoId: string, title: string) => {
    return (dispatch: Dispatch) => {
        todolistsAPI.createTask(todoId, title)
            .then(res => {
                dispatch(addTaskAC(res.data.data.item))
            })
    }
}

export const updateTaskStatusTC = (todoId: string, taskId: string, status: TaskStatuses) => {
    return (dispatch: Dispatch, getState: () => AppRootStateType) => {

        const currentState = getState().tasks[todoId].find(t => t.id === taskId);

        // // Берем стейт целиком
        // const state = getState();
        // // забираем из стейта все таски
        // const tasks = state.tasks;
        // // находим таски тудулиста по id тудулиста
        // const currentTasks = tasks[todoId];
        // // ищем конкретную таску
        // const currentTask = currentTasks.find(t => t.id === taskId)
        // // если таска найдена, меняем в ней статус
        // currentTask!.status = status;
        //

        if (currentState) {
            const model: UpdateTaskModelType = {
                title: currentState.title,
                status,
                description: currentState.description,
                priority: currentState.priority,
                startDate: currentState.startDate,
                deadline: currentState.deadline
            }
            todolistsAPI.updateTask(todoId, taskId, model)
                .then(res => {
                    dispatch(changeTaskStatusAC(taskId, status, todoId))
                })
        }
    }
}


export const updateTaskTitleTC = (todoId: string, taskId: string, title: string) => {
    return (dispatch: Dispatch, getState: () => AppRootStateType) => {
        const currentTask = getState().tasks[todoId].find(t => t.id === taskId)

        const model: UpdateTaskModelType = {
            title: title,
            status: currentTask!.status,
            description: currentTask!.description,
            priority: currentTask!.priority,
            startDate: currentTask!.startDate,
            deadline: currentTask!.deadline
        }
        todolistsAPI.updateTask(todoId, taskId, model)
            .then(res => {
                dispatch(changeTaskTitleAC(taskId, title, todoId))
            })
    }
}




