import Component from "./base-class";
import { DragTarget } from "../models/drag-drop";
import * as Project from "../models/project";
import { autobind as Autobind } from "../decorators/autobind";
import { projectState } from "../state/project-state";
import { ProjectItem } from "./project-item";
    
    // ProjectList Class
    export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget{
        assignedProjects: Project.Project[];    
    
        constructor(private type: 'active' | 'finished'){
            super('project-list', 'app', false, `${type}-projects`);
            this.assignedProjects = [];
    
            this.configure();
            this.renderContent();
        }
    
        
        @Autobind
        dragOverHandler(event: DragEvent) {
            if(event.dataTransfer && event.dataTransfer.types[0] === 'text/plain'){
                event.preventDefault();
                const listEl = this.element.querySelector('ul')!;
                listEl.classList.remove('droppable');
            }
            
        }
    
        @Autobind
        dropHandler(event: DragEvent) {
            const prjId = event.dataTransfer!.getData('text/plain');
            projectState.switchProjectStatus(prjId, this.type === 'active' ? Project.ProjectStatus.Active : Project.ProjectStatus.Finished)
        }
    
        @Autobind
        dragLeaveHandler(_: DragEvent) {
            const listEl = this.element.querySelector('ul')!;
            listEl.classList.add('droppable'); 
        }
    
        configure() {
            this.element.addEventListener('dragover', this.dragOverHandler);
            this.element.addEventListener('dragleave', this.dragLeaveHandler);
            this.element.addEventListener('drop', this.dropHandler);
    
            projectState.addListener((projects: Project.Project[]) => {
                const relevantProjects = projects.filter(prj => {
                    if(this.type === 'active'){
                        return prj.status === Project.ProjectStatus.Active;
                    }
                    return prj.status === Project.ProjectStatus.Finished;
                });
                this.assignedProjects = relevantProjects;
                this.renderProjects();
            });
        }
    
        renderContent(){
            const listId = `${this.type}-projects-list`;
            this.element.querySelector('ul')!.id = listId;
            this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS'
        }
    
        private renderProjects(){
            const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
            listEl.innerHTML = '';
            for(const prjItem of this.assignedProjects){
                new ProjectItem(this.element.querySelector('ul')!.id, prjItem);
            }
        }
    }
