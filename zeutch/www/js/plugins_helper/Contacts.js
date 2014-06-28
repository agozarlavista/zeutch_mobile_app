
// REMOVE THIS BEFORE RELEASE

// var contact = new navigator.contacts.create({'displayName':'TOEEER'});
// var mail = new ContactField('totoeeze', 'toto@maila.com', true);
// contact.emails = new Array();
// contact.emails.push(mail);
// contact.save();

var CWContacts = (CWContacts != undefined ? CWContacts : null);

if (CWContacts == null){
    CWContacts = {
	// Class properties
	_contacts: null,
	_isInit: false,
	_keys:{
	    Warn:'CWContactsWarn',
	    Contacts:'CWContacts'
	},
	_currentContacts: null,
	_defaultErrorHandler: function(error){
	    console.log("CWContacts error handler : ", error);
	},
	_defaultFields: ['displayName', 'phoneNumbers', 'emails', 'id', 'addresses', 'birthday', 'ims', 'name', 'organizations', 'photos', 'urls'],
	_getSuccess: function(contacts, callback, context){
	    var ret = [];
	    for (var i=0; i < contacts.length; i++)
	    {
            if (contacts[i]['emails'] && contacts[i]['emails'].length > 0){
		      ret.push(contacts[i]);
            }
	    }
	    context._currentContacts = ret;
	    callback(ret);
	},
	// --
	// Init function. Init the contact object
	init: function(){
	    if (!this._isInit){
		if (!window.localStorage.getItem(this._keys.Warn)){
		    console.log('CWContacts: Remember to warn the user we take its contacts informations'); // Warn the user that we access contacts
		    window.localStorage.setItem(this._keys.Warn, true);
		}
		this._isInit = true;
	    }
	},
	// Get the user contacts who have set the mail field
	// Call the callback in params with list of contacts as parameter
	getContactsWithMail: function(params){
	    if (!this._isInit) return console.log("CWContacts error: init has not been called");
	    if (!params || !params.onSuccess){
		console.log("CWContacts error : getContactsWithMail: Unknown argument");
		return null;
	    }
	    var onError = params.onError ? params.onError : this._defaultErrorHandler;
	    var options = new ContactFindOptions();
	    options.multiple=true;
	    var self = this;
	    navigator.contacts.find(this._defaultFields,
				    function(contacts){
					var c = contacts;
					self._getSuccess(c, params.onSuccess, self);
				    },
				    onError, options);
	},

	// Invite the contact, using its mail.
	// Pass the contactId, wich is in the contact list
	// This function is hard to use alone. Prefer to call inviteAll or
	// use a custom invite function (allowing the user to invite whoever he wants)
	// Since i'm not in the CW app, i cannot do it. Waiting for modal window
	inviteContact: function(contactId){
	    if (!this._isInit) return console.log("CWContacts error: init has not been called");
            var current = this._currentContacts.filter(function(e){
            return e.id == contactId;
            });
            if (!current){ // Contact is not in phone. Wrong id
            console.log("CWContacts error: inviteContact: Wrong contact id");
            return;
            }
            var mContacts = window.localStorage.getItem(this._keys.Contacts);
            if (mContacts){
            mContacts = JSON.parse(mContacts);
            var filtered = mContacts.filter(function(e){
                return e.id == contactId;
            });
            if (filtered.length > 0) {
                // Contact had already been invited
                console.log("CWContacts error : inviteContact: contact had already been invited");
                return;
            }
            }
            else
            mContacts =[];
            // current contains the contact associated with the id given as parameter
            console.log("Handle the contact invitation here. Need webservice and other stuffs");
            // handle mail sending and other stuffs
            mContacts.push(current[0]);
            window.localStorage.setItem(this._keys.Contacts, JSON.stringify(mContacts));
    },

        // Invite all contacts
        // You need to call getContactsWithMail before calling this, since
        // this function use a cached version of contact list, not the
        // phone contact list object.
        // Performance and call stack issue
        inviteAll: function(){
            if (!this._isInit) return console.log("CWContacts error: init has not been called");
            for (var i=0; i<this._currentContacts.length; i++){
            this.inviteContact(this._currentContacts[i].id);
            }
        }
    }
}
