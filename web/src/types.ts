export interface Problem {
 id: string; title: string; category: string; difficulty: string; description: string; source: string;
}
export interface Detail extends Problem {
 starter: string; solution: string; modules: Record<string,string>; directions: string;
 hint: string; complexity: string; markdown?: boolean; sourcePath: string; guideGroup: string;
}
export interface Competency {id:string;title:string;description:string;abbr:string;path:string;sections:string[];sourcePath:string}
export interface Diagram {id:string;group:string;title:string;category:string;path:string}
export interface Manifest {version:number;problems:Problem[];competencies:Competency[];diagrams:Diagram[];diagramGroups:Record<string,string>}
export interface TestResult {name:string;status:'pass'|'fail'|'skip';error?:string;duration?:number;logs?:string[]}
export interface RunResult {tests:TestResult[];logs:string[];error?:string}
export interface Attempt {at:string;passed:number;total:number;success:boolean}
export interface Progress {code?:string;solved?:boolean;bookmarked?:boolean;attempts?:Attempt[];updatedAt?:string}
export type SqlProgress = Pick<Progress,'code'|'solved'>;
export interface SavedData {version:1;problems:Record<string,Progress>;read:string[];lastProblem?:string;theme?:'light'|'dark';sqlPractice?:Record<string,SqlProgress>}
