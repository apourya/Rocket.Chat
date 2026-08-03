function module(e,m,o){let s;o.link("../../utils/client/slashCommand",{slashCommands(e){s=e}},0),s.add({command:"kick",callback(e){let{params:m}=e,o=m.trim();if(""!==o)return o.replace("@","")},options:{description:"Remove_someone_from_room",params:"@username",permission:"remove-user"}})}
//# sourceMappingURL=/dynamic/app/slashcommands-kick/client/e9e4d54b790cda793afd4c5627c79b09678e0888.map
