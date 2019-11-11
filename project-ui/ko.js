var container=document.getElementById('header');
var ideas=document.getElementById('ideas');
var ideaTable={};
var hackathonTable={};
var editedIdealikes=0;
//using sammy js and jQuery

(function($){

  var app=$.sammy('#main',function(){

         this.get('#hackathons',function(context){
               this.load('http://localhost:8080/SpringMvcJPA_Web_exploded/hackathons/.json')
                   .then(function(data){
                    
                   });
           
          });

        
         this.get('#hackathons/:hackathonId/ideas',function(context){
              self.chosenHackathonId(this.params.hackathonId);
              
             
         });

         this.get('#hackathons/ideas/:ideaId',function(context){
              selfIdea.chosenIdeadId(this.params.ideaId);
         });

         $(function(){
              app.run('#');
         });
      
  });
  /*Now handling href clicks in breadcrumb */
  $('#link1').on('click',function(){
    $('#ideaContainer').hide();
      $('#hackathonContainer').show();
  });

  $('#link2').on('click',function(){
      $('#ideaContainer').hide();
      $('#hackathonContainer').show();
  });

})(jQuery);

function getIdeaTableSettings() {
  return {
    dataSchema: { id: null, ideaSummary: null, ideaDetails: null, category: null, teamMembers: null, likes: null, likeButton: null },
    data: selfIdea.IdeasList(),
    colHeaders: [ 'ID','Idea Summary', 'Idea Details', 'Category', 'Team Members', 'Likes', 'Like Idea'],
    hiddenColumns:{
      columns:[0]
    },
    rowHeaders: true,
    height: '60%',
    width: '100%',
    filters:true,
    //readOnly: true,
    licenseKey: 'non-commercial-and-evaluation',
    modifyColWidth: function (width, col) {
      if (width > 450) {
        return 400;
      }
      if ((col === 5 || col === 6) && width < 100) {
        return 100;
      }
    },
    contextMenu:true,
    columns: [
      { data: 'id' },
      { data: 'ideaSummary' },
      { data: 'ideaDetails'},
      { data: 'category'},
      { data: 'teamMembers' },
      { data: 'likes' ,editor: Handsontable.editors.TextEditor},
      { data: 'likeButton', renderer: "html" }
    ],
    afterOnCellMouseUp: function(e,coords,td){
      $('#ideaContainer').show();
      if(coords.col===6 && coords.row!=-1){
         let likes=this.getDataAtRowProp(coords.row,'likes');
        this.setCellMeta(coords.row,coords.col-1,'readOnly',false);    
        this.setDataAtRowProp(coords.row,'likes',likes+1);
        this.setCellMeta(coords.row,coords.col-1,'readOnly',true)
        editedIdealikes=this.getDataAtRowProp(coords.row,'likes');

       let idea=new Idea();
              self.chosenIdeadId(this.getDataAtRowProp(coords.row,'id'));
               idea.ideaSummary=this.getDataAtRowProp(coords.row,'ideaSummary');
               idea.ideaDetails=this.getDataAtRowProp(coords.row,'ideaDetails');
               idea.category=this.getDataAtRowProp(coords.row,'category');
               idea.teamMembers=this.getDataAtRowProp(coords.row,'teamMembers');
       sendEditedIdea(idea);
      }
      if(coords.row!=-1 && coords.col!=6){
        removeValidationEffects();
        $('#submitButton').html('Edit');
        self.chosenIdeadId(this.getDataAtRowProp(coords.row,'id'));
        $('#ideaSummary').val(this.getDataAtRowProp(coords.row,'ideaSummary'));
          $('#ideaDetails').val(this.getDataAtRowProp(coords.row,'ideaDetails'));
          $('#teamMembers').val(this.getDataAtRowProp(coords.row,'teamMembers'));
         editedIdealikes=this.getDataAtRowProp(coords.row,'likes');
        $('#newIdeaModal').modal('show');
    
      }
    }
  
  };
}

/************************************************************* */


function Hackathon(){
  this.id=ko.observable();
  this.eventName=ko.observable();
  this.moOffice=ko.observable();
  this.dateConducted=ko.observable();
  this.ideasGenerated=ko.observable();
}

function Idea(){
  
 this.id=ko.observable();
 this.ideaSummary=ko.observable();
 this.ideaDetails=ko.observable();
 this.category=ko.observable();
 this.teamMembers=ko.observable();
 this.likes=ko.observable();
 this.likeButton="<button class='btn btn-secondary' >LIKE</button>";
}

function getHackathonTableSettings(displayData) {
  return {
    dataSchema: { id: null, eventName: null, moOffice: null, dateConducted: null, ideasGenerated: null },
    data: displayData,
    contextMenu:true,
    colHeaders: ['Event Name', 'MO Office', 'Date Conducted', "Ideas Generated"],
    // hiddenColumns:{
    //   columns:[
    //     {data:'id'}
    //   ]
    // },
    columns:[
      {data:'eventName'},
      {data:'moOffice'},
      {data:'dateConducted'},
      {data:'ideasGenerated'}
    ],
    rowHeaders: true,
    height: '33%',
    width: '100%',
    readOnly:true,
    licenseKey: 'non-commercial-and-evaluation',
    modifyColWidth: function(width, col){
      if(width < 175){
        return 175;
      }
    },
    afterOnCellMouseUp: function(e,coords,td){
      
      if(coords.col===0 && coords.row!=-1){
        $('#hackathonContainer').hide();
      
         let title=document.getElementById('title');
         title.innerText=this.getDataAtRowProp(coords.row,'eventName');
        self.goToHackathon(coords.row+1);
        $.getJSON('http://localhost:8080/SpringMvcJPA_Web_exploded/hackathons/'+self.chosenHackathonId()+'/ideas',function(data){
                
          selfIdea.processIdeasData(data.ideaDTOS);
         
            if(jQuery.isEmptyObject(ideaTable)){
              ideaTable=new Handsontable(ideas,getIdeaTableSettings());
            }
             else{
               ideaTable.updateSettings(getIdeaTableSettings());
             }
             $('#titleContainer').addClass('jumbotron jumbotron-fluid');
             $('#ideaContainer').show();
          });
        selfIdea.displayAddIdeaButton(true);
      }
      
      
    }
  };
}

function IdeaViewModel(){
  selfIdea=this;
  selfIdea.testButton=function(){console.log('Button working');};
  selfIdea.displayAddIdeaButton=ko.observable(false);
  selfIdea.addIdea=function(){
     ideaTable.alter('insert_row',ideaTable.countRows());
  };
  selfIdea.IdeasList=ko.observableArray();
  selfIdea.chosenIdeadId=ko.observable();
  selfIdea.chosenIdeaData=ko.observable();

 selfIdea.processIdeasData=function(data){
  selfIdea.IdeasList.removeAll(); 
  for(var index in data){
     var idea=new Idea();
     idea.id=data[index].id;
     idea.ideaSummary=data[index].ideaSummary;
     idea.ideaDetails=data[index].ideaDetails;
     idea.category=data[index].category;
     idea.teamMembers=data[index].teamMembers;
     idea.likes=data[index].likes;
     selfIdea.IdeasList.push(idea);
  }
 };
};

function HackathonViewModel(){
  self = this;
  self.testButton=function(){console.log('Button working');};
  self.displayAddIdeaButton=ko.observable(false);
  self.HackathonList=ko.observableArray();
  self.chosenHackathonId=ko.observable();
  self.chosenIdeadId=ko.observable();
  self.chosenIdeaData=ko.observable();
  self.processAllHackathonsData=function(data){
    
    for(var obj in data){
      
      var hackathon=new Hackathon();
      hackathon.id=data[obj].id;
      hackathon.eventName=data[obj].eventName;
      hackathon.moOffice=data[obj].moOffice;
      var date=new Date(data[obj].dateConducted);
      date.toUTCString();
      hackathon.dateConducted=date;
      hackathon.ideasGenerated=data[obj].ideasGenerated;
      self.HackathonList.push(hackathon);   
    }
  };


  self.goToHackathon=function(hackathonId){
    location.hash='hackathons/'+hackathonId+'/ideas';
      self.chosenHackathonId(hackathonId);
        
  };
  self.goToIdea=function(ideaId){location.hash='hackathons/ideas/'+ideaId;
 
};
   
   this.getData=function(){
       location.hash='hackathons';
     $.getJSON("http://localhost:8080/SpringMvcJPA_Web_exploded/hackathons/",function(data){
       
      self.processAllHackathonsData(data);
      var settings=getHackathonTableSettings(globalThis.hackathonViewModel.HackathonList());
      if(jQuery.isEmptyObject(hackathonTable)){
        hackathonTable=new Handsontable(container,settings);
      }
       else{
         hackathonTable.updateSettings(getHackathonTableSettings());
       }
     });
      
  };

}; 




var hackathonViewModel=new HackathonViewModel();
ko.applyBindings(hackathonViewModel,document.getElementById('hackathonContainer')); 
var ideaViewModel=new IdeaViewModel();
ko.applyBindings(ideaViewModel,document.getElementById('ideaContainer'));

function removeValidationEffects(){
  $('#ideaSummaryGroup').removeClass('has-error alert alert-danger');
  $('#ideaSummaryGroup').removeClass('alert alert-success');
  $('#ideaDetailsGroup').removeClass('has-error alert alert-danger');
  $('#ideaDetailsGroup').removeClass('alert alert-success');
}
//displaying modal on screen
let addIdeaButton=document.getElementById('addIdeaButton');
addIdeaButton.onclick=function(){
    removeValidationEffects();
   //clearing previous input
   $('input').val('');
   $('#ideaDetails').val('');
}
// getting new Idea data from user and performing validation
let saveData=document.getElementById('submitButton');
   
saveData.onclick=function(){
  
  validateData();
};
function sendEditedIdea(idea){
  idea.id=self.chosenIdeadId();
  idea.likes=editedIdealikes;

  $.ajax(
    'http://localhost:8080/SpringMvcJPA_Web_exploded/hackathons/ideas/'+self.chosenIdeadId(),
    {
      data:ko.toJSON(idea),
      method:"PUT",
      contentType:"application/json",
      success:function(response){
        $.getJSON('http://localhost:8080/SpringMvcJPA_Web_exploded/hackathons/'+self.chosenHackathonId()+'/ideas',function(data){
           
          selfIdea.processIdeasData(data.ideaDTOS);
          ideaTable.updateSettings(getIdeaTableSettings());
          
          });
        $('#submitButton').html('Save');
        $('#newIdeaModal').modal('hide');
      }
    }
    );
    
    }


function sendIdea(idea){
 
$.ajax(
'http://localhost:8080/SpringMvcJPA_Web_exploded/hackathons/'+self.chosenHackathonId()+'/ideas',
{
  data:ko.toJSON(idea),
  method:"post",
  contentType:"application/json",
  success:function(response){
    $('#submitButton').html('Save');
    $('#newIdeaModal').modal('hide');
    //alert(response.sucess);
    
    ideaTable.alter('insert_row',ideaTable.countRows());
    let currentRow=ideaTable.countRows()-1;
       
       ideaTable.setDataAtRowProp(currentRow,'ideaSummary',newIdea.ideaSummary);
       ideaTable.setDataAtRowProp(currentRow,'ideaDetails',newIdea.ideaDetails); 
       ideaTable.setDataAtRowProp(currentRow,'category',newIdea.category); 
       ideaTable.setDataAtRowProp(currentRow,'teamMembers',newIdea.teamMembers); 
       ideaTable.setDataAtRowProp(currentRow,'likes',newIdea.likes);
       ideaTable.setDataAtRowProp(currentRow,'likeButton',newIdea.likeButton);
    //hot2.render();
    $.getJSON('http://localhost:8080/SpringMvcJPA_Web_exploded/hackathons/'+self.chosenHackathonId()+'/ideas',function(data){
       
      selfIdea.processIdeasData(data.ideaDTOS);
      });
  }
}
);

}

function validateData(){
   let ideaSummary=$('#ideaSummary').val().trim();
   let ideaDetails=$('#ideaDetails').val().trim();
   let teamMembers=$('#teamMembers').val().trim();
   let category=document.getElementById('category');
   let validData=true;
  let selectedCategory=category.options[category.selectedIndex].text;
  
  if(validData){
    if(ideaSummary==''){
      $('#ideaSummaryGroup').addClass('has-error alert alert-danger');
      validData=false;
     }
     else{
      $('#ideaSummaryGroup').removeClass('has-error alert alert-danger');
      $('#ideaSummaryGroup').addClass(' alert alert-success');
     }
     if(ideaDetails==''){
     $('#ideaDetailsGroup').addClass('has-error alert alert-danger');
     validData=false;
    }
    else{
      $('#ideaDetailsGroup').removeClass('has-error alert alert-danger');
      $('#ideaDetailsGroup').addClass(' alert alert-success');
     }
     if(teamMembers==''){
       teamMembers='None';
     }
     if(!validData){ alert('Invalid data');}
     else{ 
          let idea=new Idea();
               idea.ideaSummary=ideaSummary;
               idea.ideaDetails=ideaDetails;
               idea.category=selectedCategory;
               idea.teamMembers=teamMembers;

       if(saveData.innerText=='Edit')
       {
        sendEditedIdea(idea); 
       }
       else{
        sendIdea(idea); 
       }
       
      }
  }
   

};


