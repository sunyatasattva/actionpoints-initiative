Battle = {};

(function(Battle){
  var globalCycle = 0,
      activeCharacter,
      characters = [];
  
  function Character(name, speed){
	  this.name   = name;
	  this.speed  = speed;
	  this.ap     = this.speed + Math.ceil(Math.random()*10);
	  this.ct     = 0;
	  this.cycle  = 0;
	  this.statii = [];
  }
  
  function Status(name, duration, type){
	  this.name     = name;
	  this.type     = type;
	  this.life     = +duration;
  }

  function initialize(){
 
	characters.sort(function(a,b){
        return b.speed - a.speed;
    });
      
    characters.forEach(function(chr){
      var characterInfo,
          turnInfo,
          cycleInfo,
          dropdown;
          
      cycleInfo       = $('<span>').addClass('badge success').html(chr.cycle);
      turnInfo        = $('<span>').addClass('badge info').html(chr.ct + ' / ' + chr.ap);
      characterInfo   = $('<li>').addClass('chr').html('<span class="chrName" data-toggle="dropdown">' + chr.name + ' <b class="caret"></b></span>');
      characterStatii = $('<ul>').addClass('statii');
      dropdown        = $('<ul>').addClass('dropdown-menu');
      
      dropdown.append( $('<li>').html('<a class="addStatus" data-toggle="modal" href="#addStatus">Add status</a>') );
      dropdown.append( $('<li>').html('<a class="displayStatii">Display statii</a>') );
      dropdown.append( $('<li>').html('<a class="removeChr">Remove character</a>') );
      
      characterInfo
      .append(cycleInfo)
      .append(turnInfo)
      .append(characterStatii)
      .append(dropdown)
      .data('chr', chr);
      
      $('#characterList').append(characterInfo);
    });
  
    activeCharacter = characters[0];
    
    $('#characterList li .chrName').dropdown();
  
    return activeCharacter;
  
  }

  function passTurn(cooldown){
    
    cooldown            = +cooldown;
    activeCharacter.ct += cooldown;
    
    if( activeCharacter.ct > activeCharacter.ap ){
      activeCharacter.cycle += Math.floor( activeCharacter.ct / activeCharacter.ap );
      activeCharacter.ct     = activeCharacter.ct % activeCharacter.ap;
    }
    
    statusPhase(activeCharacter);
    
    function getNextCharacter(){
    
      var nextCharacter;
    
      characters.sort(function(a,b){
	      if(a.cycle - b.cycle === 0){
		      if(a.ct - b.ct !== 0)
		        return a.ct - b.ct;
		      else
		        return b.speed - a.speed;
		  }
		  else
		  	return a.cycle - b.cycle;
      });
    
      nextCycle = characters.every(function(chr){
        return (chr.cycle !== globalCycle);
      });
    
      if(nextCycle)
        globalCycle++;
    
      for(i = 0; i < characters.length; i++){
        if(characters[i].cycle == globalCycle){
          nextCharacter = characters[i];
          break;
        }
      }
        
      return nextCharacter;
    
    }
  
    activeCharacter = getNextCharacter();
  
    updateUI();
  
    return activeCharacter.name;
  
  }

  function updateUI(){
    var characterInfo,
        turnInfo,
        cycleInfo;
        
    $('#characterList').empty();
    $('h3 .badge').html(globalCycle);
    characters.forEach(function(chr){
      cycleInfo       = $('<span>').addClass('badge').html(chr.cycle);
      turnInfo        = $('<span>').addClass('badge info').html(chr.ct + ' / ' + chr.ap);
      characterInfo   = $('<li>').addClass('chr').html('<span class="chrName" data-toggle="dropdown">' + chr.name + ' <b class="caret"></b></span>')
      characterStatii = $('<ul>').addClass('statii');
      dropdown        = $('<ul>').addClass('dropdown-menu');
      
      dropdown.append( $('<li>').html('<a class="addStatus" data-toggle="modal" href="#addStatus">Add status</a>') );
      dropdown.append( $('<li>').html('<a class="displayStatii">Display statii</a>') );
      dropdown.append( $('<li>').html('<a class="removeChr">Remove character</a>') );
      
      chr.cycle > globalCycle ? cycleInfo.addClass('danger') : cycleInfo.addClass('success');
            
      characterInfo
      .append(cycleInfo)
      .append(turnInfo)
      .append(characterStatii)
      .append(dropdown)
      .data('chr', chr);
      
      $('#characterList').append(characterInfo);
    });
  
  }
  
  function removeCharacter(chr){
	  var idx = characters.indexOf(chr);
	  characters.splice(idx, 1);
	  
	  updateUI();
  }
  
  function addStatus(status, target){
	  target.statii.push(status);
	  return status;
  }
  
  function getStatus(status, chr){
    for(var i = 0; i < chr.statii.length; i += 1) {
        if(chr.statii[i]['name'].toLowerCase() === status.toLowerCase()) {
            return chr.statii[i];
        }
    }
    return false;
  }
  
  function removeStatus(status, chr){
  	var status = getStatus(status, chr);
  	var idx    = chr.statii.indexOf(status);
  	
  	chr.statii.splice(idx, 1);
  	
  	return status;
  }
  
  function statusPhase(chr){
  	var removedStatii = [];
  
  	chr.statii.forEach(function(status){
	  	status.life--;
  	
	  	if( status.life === 0 )
  			removedStatii.push(status.name);
    });
    
    removedStatii.forEach(function(status){
	    removeStatus(status, chr)
    })
  }
  
  Battle.globalCycle     = globalCycle;
  Battle.characters      = characters;
  Battle.activeCharacter = activeCharacter;
  Battle.initialize      = initialize;
  Battle.Character       = Character;
  Battle.Status          = Status;
  Battle.passTurn        = passTurn;
  Battle.removeCharacter = removeCharacter;
  Battle.addStatus       = addStatus;
  Battle.getStatus       = getStatus;
  Battle.removeStatus    = removeStatus;
  
}(Battle));

$('#addCharacter').click(function(){
  if( $('#chrName').val() === '' ) {
	  $('#feedback')
	  .html('Please insert a character name')
	  .removeClass('alert-info alert-success');
	  
	  $('#chrName').focus();
	  return false;
  }
  else if( $('#chrSpeed').val() === '' ) {
	  $('#feedback')
	  .html('Please insert a speed value for ' + $('#chrName').val())
	  .removeClass('alert-info alert-success');
	  
	  $('#chrSpeed').focus();
	  return false;
  }
  else {
	  var name  =  $('#chrName').val();
	  var speed = +$('#chrSpeed').val();
	  var chr   = new Battle.Character(name,speed);
	  Battle.characters.push(chr);
	  
	  $('#feedback')
	  .html(chr.name + ' joined the combat')
	  .removeClass('alert-info')
	  .addClass('alert-success');
	  
	  $('#chrName')
	  .add('#chrSpeed')
	  .val('')
	  
	  $('#chrName').focus();
	  
	  return chr;
  }
});

$('#initialize').click(function(){
  if( Battle.characters.length === 0 ) {
	  $('#feedback')
	  .html('It is not a battle without participants: add some!')
	  .removeClass('alert-info alert-success');
	  return false;
  }
  if( Battle.characters.length === 1 ) {
	  $('#feedback')
	  .html('Is ' + Battle.characters[0].name + ' really fighting with himself? Add more participants.')
	  .removeClass('alert-info alert-success');
	  return false;
  }
  Battle.initialize();
  
  $('#ini').empty();
  $('#track').show();
  
  return Battle.characters;
  
});

$('#passTurn').click(function(){
  var cooldown = +$('#cooldown').val();
  $('#cooldown').val('');
  return Battle.passTurn(cooldown);
});

$('#characterList').on('click', '.removeChr', function(e){
	var chr = $(e.target).closest('li.chr').data('chr');
	Battle.removeCharacter(chr);
});

$('#characterList').on('click', '.addStatus', function(e){
	var chr = $(e.target).closest('li.chr').data('chr');
	$('#addStatus').data('target', chr);
});

$('#addStatus .btn-primary').on('click', function(e){
	var target         = $('#addStatus').data('target');
	var statusName     = $('#statusName').val();
	var statusDuration = $('#statusDuration').val();
	var statusType     = $('#addStatus #radioControls input:checked').val();
	
	var status         = new Battle.Status(statusName, statusDuration, statusType);
	
	Battle.addStatus(status, target);
});

$('#characterList').on('click', '.displayStatii', function(e){
	var el   = $(e.target).closest('li.chr');
	var list = el.find('.statii');
	var chr  = el.data('chr');
	
	list.empty();
	
	chr.statii.forEach(function(status){
		var statusInfo = $('<li>').addClass('status ' + status.type).html(status.name + '<span class="badge">' + status.life + '</span>');
		statusInfo.data('status', status);
		
		status.type === 'positive' ? statusInfo.find('.badge').addClass('success') : statusInfo.find('.badge').addClass('danger');
		
		list.append(statusInfo);
	})
	
	list.slideDown();
	
	$(e.target)
	.removeClass('displayStatii')
	.addClass('hideStatii')
	.text('Hide statii');
});

$('#characterList').on('click', '.hideStatii', function(e){
	var el   = $(e.target).closest('li.chr');
	var list = el.find('.statii');
	
	list.slideUp();
	
	$(e.target)
	.removeClass('hideStatii')
	.addClass('displayStatii')
	.text('Display statii');
});