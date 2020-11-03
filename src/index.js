const VueValidate = {
   _uuid: 0
}
const store = {
   $get(path) {
      try {
         const pathArray = path.split("/")
         let result = this
         for (let index = 0, length = pathArray.length; index < length; index++) {
            result = result[pathArray[index]]
         }
         return result
      } catch (e) {}
   },
   /*
      [ name group ]: {
         
         /* [ name input ]: {
            value: [ value ],
            required: boolean,
            pattern: RegExp,
            error: boolean
         }
         
         Vue.reactiveProperty(this, nameGroup, value)
      },*/
}

function getStatus(el) {
   let { tagName, type, files, value, __conf_vue_validate } = el
   const { modifiers, regexp } = __conf_vue_validate
   const valueEl = value

   switch (tagName) {
      case "INPUT":
         switch (type.toUpperCase()) {
            case "FILE":
               value = [...files].map(e => e.type)
               break
            default:
               value = [value]
         }
         break
      case "TEXTAREA":
         // tag input:not(type="file")
         value = [value]
         break
      case "SELECT":
         if (el.hasAttribute("multiple")) {
            value = [...el.getElementsByTagName("option")].filter(e => e.selected).map(e => e.value)
         } else {
            value = [value]
         }
         break
      default:
         return console.error("Element watch value not is a select, input and textarea.")
   }
   
   return {
      value: type.toUpperCase() == "FILE" ? files : value,
      required: modifiers.disabled ? false : modifiers.required ? value.length == 0 : false,
      pattern: regexp(),
      error: modifiers.disabled ? false : !(modifiers.required ? value.length && !value.some(e => !e.match(regexp())) : (value.length == 0 || !value.some(e => !e.match(regexp()))))
   }
}

function renderConfig(el, rawName, value) {
   const config = {
      uuid: el.__conf_vue_validate_uuid,
      name: el.hasAttribute("name") ? el.getAttribute("name") : el.__conf_vue_validate_uuid + "",
      value,
      ...(typeof value == "object" ? value : {}),
      modifiers: { ...(typeof value == "object" ? value : {}).modifiers }
   }

   config.modifiers.required = config.modifiers.required || el.hasAttribute("required")

   for (let modifiers = (rawName.match(/\.[^\.:]+/g) || []), length = modifiers.length, index = 0; index < length; index++) {
      config.modifiers[modifiers[index].replace(/^\./, "")] = true
   }

   config.arg = (rawName.match(/:[^\.:]+/) || [""])[0].replace(/^:/, "")

   if (config.arg.match(/^\$/)) {
      return console.error(`Vue-validate: that the group's name must not start with "$" in ${rawName}="${value}"`)
   }
   if (config.name.match(/^\$/)) {
      return console.error(`Vue-validate: that the input's name must not start with "$" in ${rawName}="${value}"`)
   }

   config.regexp = function() {
      let match
      if (value instanceof RegExp) {
         match = ["", value.source, value.flags]
      } else {
         match = (value + "").match(/^\/([\w\d\s\S]+)(?:\/(\w{0,}))$/)
      }
      if (config.modifiers.absolute) {
         match[1] = "^" + match[1].replace(/^\^+/, "^").replace(/\$+$/, "$") + "$"
      }

      return new RegExp(...match.slice(1))
   }
   return config
}

function updateReactive(Vue, el, { valid, invalid }) {
   if (!store[el.__conf_vue_validate.arg]) {
      Vue.set(store, el.__conf_vue_validate.arg, {
         [el.__conf_vue_validate.name]: getStatus(el),
         get $is() {
            for (const name in this) {
               if (name !== "$is") {
                  if (this[name].error) {
                     return false
                  }
               }
            }
            return true
         }
      })
   } else {
      if (store[el.__conf_vue_validate.arg][el.__conf_vue_validate.name]) {
         store[el.__conf_vue_validate.arg][el.__conf_vue_validate.name] = getStatus(el)
      } else {
         Vue.set(store[el.__conf_vue_validate.arg], el.__conf_vue_validate.name, getStatus(el))
      }
   }
   
   invalid = el.has("invalid-class") ? el.getAttribute("invalid-class") : invalid
   valid = el.has("valid-class") ? el.getAttribute("valid-class") : valid 
   
   if ( store[el.__conf_vue_validate.arg][el.__conf_vue_validate.name].error ) {
      el.classList.remove(valid)
      el.classList.add(invalid) 
   } else {
      el.classList.remove(invalid)
      el.classList.add(valid) 
   }
}

VueValidate.install = (Vue, configGlobal = {
      valid: "vue-validate",
      invalid: "vue-invalidate"
   }) => {
   Vue.directive("validate", {
      bind(el, { rawName, value, name }) {
         el.__conf_vue_validate_uuid = VueValidate._uuid++
         const config = renderConfig(el, rawName, value)
         el.__conf_vue_validate = config

         updateReactive(Vue, el, configGlobal)
         el.addEventListener("input", el.__vue_validate_event = ({ target }) => {
            if (!target.__conf_vue_validate) {
               return console.error("Vue-validtate: Error unknown. No options in element.")
            }

            updateReactive(Vue, target, configGlobal)

         })
      },
      update(el, { rawName, value }) {
         el.__conf_vue_validate = renderConfig(el, rawName, value)
      },
      unbind(el) {
         el.removeEventListener("input", el.__vue_validate_event)
      }
   })
   Vue.mixin({
      beforeCreate() {
         Vue.util.defineReactive(this, "$validate", store)
      }
   })
}
export default VueValidate